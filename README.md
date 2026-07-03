# 消费者行为分析与预测智能体

这是 AI4S 课程大作业的 Web Demo，题目选择为“消费者行为分析和预测”。

## 本地使用

1. 双击打开 `index.html`。
2. 点击“载入样例”，或者上传 `sample_consumer_behavior.csv`。
3. 点击“分析数据”，查看分群、漏斗和诊断。
4. 输入阿里云百炼 API Key。
5. 点击“生成报告”，调用 `qwen-plus` 生成智能分析报告。

## CSV 字段

推荐字段如下：

- `user_id`：用户 ID
- `visits_30d`：近 30 天访问次数
- `product_views`：商品浏览次数
- `add_to_cart`：加购次数
- `purchases`：购买次数
- `total_spend`：累计消费金额
- `days_since_last_purchase`：最近一次购买距今天数
- `coupon_clicks`：优惠券点击次数
- `support_tickets`：客服或售后次数

页面也兼容部分中文表头，例如“用户ID”“访问次数”“浏览次数”“加购次数”“购买次数”“消费金额”“最近一次购买距今天数”。

## 部署到 GitHub Pages

1. 新建 GitHub 仓库。
2. 上传 `index.html`、`style.css`、`app.js`、`sample_consumer_behavior.csv`。
3. 进入仓库 `Settings` -> `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main` 和 `/root`。
6. 保存后等待 GitHub 生成访问 URL。

## 注意

不要把自己的阿里云 API Key 写进代码或提交到 GitHub。这个 Demo 使用网页输入框临时填写 Key，刷新页面后不会保存。
