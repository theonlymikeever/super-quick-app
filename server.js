/* globals $ */
//requires & server
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const Sequelize = require('sequelize');

//middleware and config
nunjucks.configure('views', {noCache: true} );
app.set('view engine', 'html')
app.engine('html', nunjucks.render);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/jquery', express.static(`${__dirname}/node_modules/jquery/dist`));

//models
const db = new Sequelize(process.env.DATABASE_URL);

const Thing = db.define('thing', {
  name: {
    type: Sequelize.STRING
  }
});

//sync and seed
const port = process.env.PORT || 3000;
db.sync({ force: true })
  .then(() => {
   return Promise.all([
      Thing.create({ name: 'Peanut' }),
      Thing.create({ name: 'Butter' }),
      Thing.create({ name: 'Jelly' }),
    ])
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    })
  })


app.get('/', (req, res, next) => {
  Thing.findAll()
  .then((things) => {
    res.render('index', {things});
  })
})

app.post('/', (req, res, next) => {
  const input = req.body;
  console.log(input);
  Thing.create(input)
    .then(res.sendStatus(201))
    .catch(next);
})
