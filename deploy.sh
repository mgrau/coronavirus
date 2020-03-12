rm *.js *.css
parcel build src/index.html -d ./ --no-source-maps --public-url ./
git add *.js *.css
git commit -a -m "redeploy"
git push