# RUN THIS SCRIPT WITH: 
# ./deploy-script.sh v15
#!/bin/zsh

app="frontend"
cd ~/Documents/Repositories/interviewai-main/interviewai-$app

backend_url="https://interviewai-pro-backend-sekyu5peqq-uc.a.run.app"
location="us-central1"
project_name="interviewai-pro"
repository_name="interviewai-pro-ar-$app"
image="image-$app-$1"

# docker system prune -af
# docker image prune -af

gcloud config set run/region $location
gcloud config set project $project_name
gcloud services enable artifactregistry.googleapis.com
gcloud auth configure-docker $location-docker.pkg.dev

# remove any cached data
rm -rf .next

# Switch to a 2.4GHz Internet Connection if fails
docker buildx build --platform linux/amd64 -t $location-docker.pkg.dev/$project_name/$repository_name/$image --build-arg NEXT_PUBLIC_PROD_URL=$backend_url .
# docker push $location-docker.pkg.dev/$project_name/$repository_name/$image
# this one works better with no failure
docker push gcr.io/interviewai-pro/$image

gcloud run deploy $project_name-$app \
    --image=gcr.io/interviewai-pro/$image \
    --platform=managed \
    --region=$location \
    --port=3000 \
    --service-account cloud-run-service-account@interviewai-pro.iam.gserviceaccount.com \
    --verbosity=debug