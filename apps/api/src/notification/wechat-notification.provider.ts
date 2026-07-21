import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider, SendOrderNotificationPayload } from './notification.types';

@Injectable()
export class WechatNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(WechatNotificationProvider.name);

  // access_token 内存缓存（微信有效期 7200s，多实例/重启会失效，开发足够；生产建议走 Redis）
  private accessToken: string | null = null;
  private tokenExpireAt = 0;

  private get appId(): string | undefined {
    return process.env.WECHAT_APP_ID;
  }
  private get appSecret(): string | undefined {
    return process.env.WECHAT_APP_SECRET;
  }
  private get templateId(): string | undefined {
    return process.env.WECHAT_MESSAGE_TEMPLATE_ID;
  }

  async sendOrderCreated(
    payload: SendOrderNotificationPayload,
  ): Promise<'sent' | 'fallback' | 'failed'> {
    const templateId = this.templateId;

    // 未配置真实订阅消息模板（仍是占位 tmpl_demo）时，不发送，交由上层走站内提醒
    if (!templateId || templateId === 'tmpl_demo') {
      this.logger.warn(
        'WECHAT_MESSAGE_TEMPLATE_ID 未配置真实订阅消息模板，跳过微信发送（请到公众平台申请「新订单通知」模板并填入 .env）',
      );
      return 'failed';
    }
    if (!this.appId || !this.appSecret) {
      this.logger.error('缺少 WECHAT_APP_ID / WECHAT_APP_SECRET，无法获取 access_token，跳过发送');
      return 'failed';
    }

    try {
      const token = await this.getAccessToken();
      const res = await fetch(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            touser: payload.chefOpenId,
            template_id: templateId,
            page: 'pages/orders/index',
            miniprogram_state: 'developer', // 预览/真机调试填 developer；体验版填 trial；正式版填 formal
            // ⚠️ 字段后缀数字(1/2/..)以你【公众平台→订阅消息→我的模板→模板详情】里实际显示为准。
            //    对照你的模板，把下面键名改成真实字段名即可。推荐类型：
            //    订单编号→character_string / 详情→thing / 申请人→name / 订单状态→phrase / 温馨提示→thing
            data: {
              character_string3: { value: payload.orderShortId || String(payload.orderId).slice(-4).toUpperCase() },
              thing2: { value: (payload.summary || '新订单').slice(0, 20) },
              thing6: { value: (payload.customerNickname || '顾客').slice(0, 10) },
              phrase1: { value: this.statusLabel(payload.status) },
              thing4: { value: '您有新的点单，请尽快处理~'.slice(0, 20) },
            },
          }),
        },
      );
      const json: any = await res.json();
      if (json.errcode === 0) {
        this.logger.log(`订阅消息发送成功 order=${payload.orderId} -> ${payload.chefOpenId}`);
        return 'sent';
      }
      this.logger.warn(
        `订阅消息发送失败 order=${payload.orderId} errcode=${json.errcode} errmsg=${json.errmsg}`,
      );
      return 'failed';
    } catch (error: any) {
      this.logger.error(`订阅消息发送异常 order=${payload.orderId}: ${error?.message || error}`);
      return 'failed';
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpireAt - 60_000) {
      return this.accessToken;
    }
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
    const res = await fetch(url);
    const json: any = await res.json();
    if (json.errcode) {
      throw new Error(`获取 access_token 失败 errcode=${json.errcode} errmsg=${json.errmsg}`);
    }
    const token = json.access_token as string;
    this.accessToken = token;
    this.tokenExpireAt = now + (json.expires_in || 7200) * 1000;
    this.logger.log('access_token 已刷新');
    return token;
  }

  private nowText(): string {
    const d = new Date();
    const p = (n: number) => (n < 10 ? '0' + n : '' + n);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  private statusLabel(status?: string): string {
    const map: Record<string, string> = {
      pending: '待接单',
      preparing: '制作中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return (status && map[status]) || '待接单';
  }
}
