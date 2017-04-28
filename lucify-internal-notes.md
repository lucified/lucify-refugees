
# Internal notes

These are internal notes for this project, intended only for the internal use by Lucify.

## Update data

Run at `lucify-refugees` project root
```
src/scripts/download-unhcr-data.sh
./prepare.sh
```

Update the "updated at" date and (possibly) the end date in refugee-constants.js.
Check http://data.unhcr.org/syrianrefugees/regional.php and update the values
and dates in refugee-soccer-segment.jsx.

Test that everything works
```
gulp
```

This is no longer required, but to update the NPM package, run the following:
```shell
npm version patch
git push --follow-tags
npm publish
```

## Deploying lucify-refugees locally

Run the following commands in the `lucify-refugees` project root:

### Development

```shell
LUCIFY_ENV=development AWS_PROFILE=lucify-protected FLOW_TOKEN=$FLOW_TOKEN_MAIN npm run-script deploy
```

### Production

First, assume the admin role. Then run the following command:
```shell
LUCIFY_ENV=production FLOW_TOKEN=$FLOW_TOKEN_MAIN npm run-script deploy
```

Once deployed, check that embeds work. Note that it can take up to 10 minutes for the visualisation to update in CDN.
