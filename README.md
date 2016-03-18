# create-from-slack

steps

1. create a bot user for your slack team and copy the access token for it

2. create a .env file with 
  ```
  SLACK_TOKEN=xxxxxx
  METAMAP_ID=XX
  ```
  replacing the all the x's with valid values. 
  The METAMAP_ID will be the map that any topics you create get posted to

3. run `npm install`

4. run `node main.js`

5. go to metamaps and retrieve an access token for your user by going to the home page, signing in, and then opening the console. 
  With the javascript console open, run
  ```
  var token = $.post('/api/v1/tokens', { token: { description: 'token for slack' }});
  token.responseJSON.tokens[0].token
  ```
  copy that token value into your clipboard

6. go to slack, and open a direct message conversation with your bot, then type in 
  ```
  token XXXXXXX
  ```
  and replace the X's with your token from metamaps

7. in any channel that your bot is in, including your private chat with it, you can create topics onto your map
  You can do this by first adding the emoji which represents the metacode you want to use, for example
  ```
  :group:
  ```
  then add a space, then type the name for the topic
  ```
  :group: My Group
  ```
  You must put only one topic in each message for now. 
  Note: you will only be able to create topics of the types which are listed in the `metamaps.js` file under metacodes

