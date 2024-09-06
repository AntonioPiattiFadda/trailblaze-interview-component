This is a NextJS featured starter template containing the Following features and more:
## Features

- Tailwind CSS
- Google analytics
- Page loader animation
- Dynamic Head component | SEO
- Responsive Navbar
- Footer
- Toast Notifications


## Getting Started

This is a modified version of create-next-app with multiple useful features to get started in a flash, to use this run this in terminal

```bash
git clone https://github.com/lifeofsoumya/NextJS-featuredStarterTemplate.git my-app
```

Then, enter the directory using:
```bash
cd my-app
```

Install the packages using:
```bash
npm i
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

### DEV `TEST LOCALLY WITHOUT DOCKE (QUICKER)` ###
# Update .env File
# if errors: rm -rf .next && rm -rf build (try build after) and npm install or npm run build
npm run dev

### STAGING `TEST LOCALLY WITH DOCKER` ###
    # hello@intervieai.pro
    gcloud auth application-default login 
    version="v7"
    backend_url="https://interviewai-pro-backend-sekyu5peqq-uc.a.run.app"
    
    docker stop $version-frontend && docker rm $version-frontend && docker image prune -af
    docker build --no-cache -t $version-frontend --build-arg NEXT_PUBLIC_PROD_URL=$backend_url .

    docker run --name $version-frontend -p 3000:3000 \
        -v ~/.config/gcloud/application_default_credentials.json:/secrets/key.json \
        -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/key.json $version-frontend
    
# FOR PROD Cloud Run Deployment
./deploy-script.sh v1
