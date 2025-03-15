# Deploying TweetX Frontend to Vercel

This guide explains how to deploy the TweetX frontend to Vercel from your monorepo structure.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Git repository with your TweetX monorepo code
- Backend already deployed on Render.com (or another platform)

## Deployment Steps

### Step 1: Connect Your Repository

1. Log in to your Vercel account.
2. Click on "Add New..." and select "Project".
3. Connect your Git provider (GitHub, GitLab, or Bitbucket) if you haven't already.
4. Select your TweetX repository from the list.

### Step 2: Configure Project Settings

Configure the project with the following settings:

1. **Project Name**: Choose a name for your project (e.g., "tweetx-frontend").
2. **Framework Preset**: Select "Next.js" from the dropdown.
3. **Root Directory**: Enter `frontend` to specify the subdirectory containing your Next.js application.
4. **Build and Output Settings**:
   - Build Command: `npm run build` (or leave as default)
   - Output Directory: `.next` (or leave as default)
   - Install Command: `npm install` (or leave as default)

### Step 3: Environment Variables

Add the following environment variables:

1. Click on "Environment Variables" section.
2. Add the following key-value pairs:
   - `NEXT_PUBLIC_API_URL`: The URL of your backend API (e.g., `https://tweetx-backend.onrender.com/api/v1`)
   - `NEXT_PUBLIC_ENV`: `production`

### Step 4: Deploy

1. Click "Deploy" to start the deployment process.
2. Vercel will clone your repository, navigate to the frontend directory, install dependencies, build the application, and deploy it.
3. Once the deployment is complete, you'll receive a URL for your deployed frontend (e.g., `https://tweetx-frontend.vercel.app`).

## Automatic Deployments

By default, Vercel will automatically deploy your frontend whenever you push changes to your repository. You can configure this behavior in the project settings:

1. Go to your project in the Vercel dashboard.
2. Navigate to "Settings" > "Git".
3. Under "Production Branch", you can specify which branch should trigger production deployments.
4. You can also configure preview deployments for other branches and pull requests.

## Custom Domains

To use a custom domain for your frontend:

1. Go to your project in the Vercel dashboard.
2. Navigate to "Settings" > "Domains".
3. Click "Add" and enter your domain name.
4. Follow the instructions to configure your DNS settings.

## Troubleshooting

If you encounter issues with your Vercel deployment, check the following:

1. **Build Errors**: Review the build logs for any errors during the build process.
2. **Environment Variables**: Ensure all required environment variables are correctly set.
3. **API Connection**: Verify that the backend API URL is correct and accessible.
4. **CORS Issues**: Make sure your backend allows requests from your Vercel domain.
5. **Monorepo Structure**: Confirm that the root directory is correctly set to `frontend`.

## Connecting to the Backend

To ensure your frontend can communicate with your backend:

1. Make sure the backend's CORS settings allow requests from your Vercel domain.
2. In your backend's CORS configuration, add your Vercel domain to the list of allowed origins.
3. Verify that the `NEXT_PUBLIC_API_URL` environment variable is correctly set in your Vercel project settings.

Example CORS configuration in your FastAPI backend:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For more help, refer to the [Vercel documentation](https://vercel.com/docs) or contact Vercel support.
