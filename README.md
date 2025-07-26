
# TweeterLens 🔍

![TweeterLens Banner](./screenshots/banner.png)

## ❌ Important Notice: Product Temporarily Unavailable

### 🚫 Product Status: Not Working

Thank you for checking out this project. This product was built to fetch full analytics for any X (formerly Twitter) profile, using the powerful and free-tier tool — **SocialData**.

---

## ⚙️ How It Worked (Previously)

This tool used to:

- Pull in post-level and profile-level analytics from public X accounts
- Analyze data through the SocialData API  
- Provide detailed insights like engagement rate, follower growth, post frequency, and more

It was fully functional and verified to be working until recently.

---

## ❗ Why It's Not Working Now

As of now, the core data source — **SocialData** — is not functioning properly.

**Reason:** X (Twitter) has recently restricted external tools from accessing public post data, including API-level access.

Due to this change, SocialData can no longer fetch posts or analytics from X profiles.

Since my product is fully dependent on SocialData, it is currently **non-functional**.

---

## 🧠 What You Should Know

- This issue is **not with my code or product**, but with the upstream tool (SocialData) being blocked by X.
- This means **you won't get any analytics or data** if you try to use this tool right now.
- I'm keeping the repo/code live for transparency, experimentation, and possible future fixes.

---

## 📅 Future Plans

- I'm actively monitoring the situation with SocialData and exploring other possible data sources or workarounds.
- If SocialData regains access or an alternative emerges, this product may become functional again.

---

## ✅ TL;DR

> **This product is currently not working.**  
> **Root Cause:** SocialData is blocked from accessing X posts.  
> **No ETA yet.** Stay tuned.

---

If you have any questions or know of any working alternatives to SocialData, feel free to raise an issue or contact me directly.

**Thank you for understanding 🙏**

---

## 📖 About TweeterLens (When It Was Working)

TweeterLens was a powerful Twitter analytics and visualization tool that helped you explore and analyze any Twitter profile with beautiful, interactive dashboards. It provided detailed insights into posting patterns, engagement metrics, and content performance.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FUtkarshTheDev%2FTweeterLens)
[![Follow on Twitter](https://img.shields.io/twitter/follow/UtkarshTheDev?style=social)](https://twitter.com/UtkarshTheDev)

### ✨ Features (When Working)

- **Profile Analysis**: Enter any Twitter username to analyze their posting history and engagement patterns
- **Detailed Analytics**: View engagement metrics, hashtag usage, and interactive heatmaps of activity patterns
- **GitHub-Style Contribution Graph**: Visualize posting frequency with a beautiful contribution heatmap
- **Engagement Metrics**: Track likes, retweets, replies, and views with detailed breakdowns
- **Posting Patterns**: Discover optimal posting times and consistency metrics
- **Fast & Efficient**: Smart caching and optimized data fetching for quick results
- **Shareable Stats**: Copy and download visualizations to share on social media
- **Server-Side Rendering**: Optimized performance with Next.js SSR

### 🚀 Live Demo

~~Check out the live demo at [https://tweeterlens.vercel.app](https://tweeterlens.vercel.app)~~

**Demo is currently unavailable** due to X/Twitter API restrictions.

### 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [Social Data API](https://socialdata.tools) *(currently non-functional)*
- **Caching**: [Upstash Redis](https://upstash.com/)
- **Deployment**: [Vercel](https://vercel.com)

## 🔧 Getting Started (For Future Reference)

> **⚠️ IMPORTANT:** This application is currently non-functional due to X/Twitter API restrictions. The setup instructions below are preserved for when service is restored.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Bun](https://bun.sh/) (recommended) or npm/yarn
- [Social Data API](https://socialdata.tools) key *(currently non-functional)*

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/UtkarshTheDev/TweeterLens.git
   cd TweeterLens
   ```

2. Install dependencies:

   ```bash
   bun install
   # or
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

4. Start the development server:

   ```bash
   bun dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Social Data API](https://socialdata.tools) for providing Twitter data access *(when it was working)*
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Vercel](https://vercel.com) for hosting and deployment
- [Next.js](https://nextjs.org/) for the amazing React framework

## 📧 Contact

- Twitter: [@UtkarshTheDev](https://twitter.com/UtkarshTheDev)
- GitHub: [UtkarshTheDev](https://github.com/UtkarshTheDev)

---

Built with ❤️ by [Utkarsh Tiwari](https://twitter.com/UtkarshTheDev)
