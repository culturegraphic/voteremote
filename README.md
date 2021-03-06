# Post Your Vote
Getting out the vote since 2020 also only in 2020
- [postyour.vote](https://postyour.vote)
- Learn more from [1-pager](https://paper.dropbox.com/doc/Vote-Remote-Iyyot2jRrGwQz9s383GgE)

## App overview
- Express.js with scaffolding from generator `express --view=pug --css=sass`
- Pug view engine (formerly Jade) & Sass CSS engine

## Get started
- Mac: Update Xcode & developer tools
- Install Homebrew
- Install Node & NPM with `brew install node`
- Clone git repo `https://github.com/culturegraphic/voteremote`
- Install dependencies `npm install`
- Make a copy of `dbConfig.template.json` as `dbConfig.json` and add your credentials. This file is in `.gitignore` and will not be checked in. **DO NOT COMMIT ANY CREDENTIALS TO GIT**
  - mongo username and password are configured with your mongo atlas account (ask Zac)
  - `airtableKey` is configured in your personal airtable account page
- Start! `npm run dev`
- Open http://localhost:3000 in your browser

## Housekeeping
- Keep commits tidy with verb to describe changes made "Updates CSS for primary flow"

## Deploy
- Pushes to git master automatically deploy to Heroku

# Technical Details

## Connect to the Mongo database

1. Make sure you have your own DB developer user/pass at https://cloud.mongodb.com/v2/5f00c43c699a9d770b8db9b4#security/database/users. This is different from your DB web dashboard login.
2. Make sure your IP address is listed in https://cloud.mongodb.com/v2/5f00c43c699a9d770b8db9b4#security/network/whitelist. Click on *Add IP Address* and the "My current IP Address".
3. Make a copy of `dbConfig.template.json` as `dbConfig.json` and add your credentials. This file is in `.gitignore` and will not be checked in. **DO NOT COMMIT ANY CREDENTIALS TO GIT**

You can also connect to the database with the mongo shell on the CLI. You will be prompted for you PW.
```
mongo "mongodb+srv://cluster0.fe6lk.mongodb.net/<dbname>" --username <username>
```

## Updating postal code database

Postal codes are stored in Mongodb and the data is sources from the free downloadable Geonames database. See `database.md` for more information on our mongo database.

http://www.geonames.org/export/
or directly, 
https://download.geonames.org/export/zip/US.zip

The zip contains a CSV file. If you need to update the postal codes, you can import the CSV into mongo. First make sure to delete the existing postalcodes to avoid duplicate data:

```
mongo "mongodb+srv://cluster0.fe6lk.mongodb.net/voteremote" --username <user>
> db.postalcodes.truncate()
```

Then import the data from the CSV file. Since it doesn't have a header row we need to specify the header on the command line.
```
mongoimport --uri="mongodb+srv://zac@cluster0.fe6lk.mongodb.net/voteremote" --collection postalcodes --fields "country code,postal code,place name,admin name1,admin code1,admin name2,admin code2,admin name3,admin code3,latitude,longitude,accuracy" --type csv --stopOnError --file ~/Desktop/us_postal_codes/US.txt
```
