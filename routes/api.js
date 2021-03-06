var mongoose       = require('mongoose')
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10
  , MovieSchema    = require('../models/movie')
  , UserSchema     = require('../models/user')
  , FavsSchema     = require('../models/favs')
  , FeedbackSchema = require('../models/feedback');

var MovieModel    = mongoose.model('Movie', MovieSchema.Movie);
var FeedbackModel = mongoose.model('Feedback', FeedbackSchema.Feedback);
var UserModel     = mongoose.model('User', UserSchema.userSchema);
var FavsModel     = mongoose.model('Favs', FavsSchema.Favs);
var moviesPerPage = 30;

exports.moviesByReleaseDate = function(req, res){
  var pageTo = req.params.page * 30;

  MovieModel.find({ }).sort('-release_date').limit(moviesPerPage).skip(pageTo).execFind(function(err, results){
    if (!err)
      res.render('apiMoviesPaginated', { m:  results, user: req.user });
    else
      console.log('Error: ' + err)
  });
};

exports.moviesByAddedDate = function(req, res){
  var pageTo = req.params.page * 30;

  MovieModel.find({ }).sort('-modified').limit(moviesPerPage).skip(pageTo).execFind(function(err, results){
    if (!err)
      res.render('apiMoviesPaginated', { m:  results, user: req.user });
    else
      console.log('Error: ' + err)
  });
};

exports.moviesByRating = function(req, res){
  var pageTo = req.params.page * 30;

  MovieModel.find({ }).sort('-rating').limit(moviesPerPage).skip(pageTo).execFind(function(err, results){
    if (!err)
      res.render('apiMoviesPaginated', { m:  results, user: req.user });
    else
      console.log('Error: ' + err)
  });
};

exports.moviesSearch = function(req, res){
  var pageTo = req.params.page * 30;
  var  filtersObject = JSON.parse(req.body.parameters);

  MovieModel.find({ title: new RegExp(filtersObject.q, 'i') }).sort('-rating').limit(moviesPerPage).skip(pageTo).execFind(function(err, results){
    if (!err)
      res.render('apiMoviesPaginated', { m:  results, user: req.user });
    else
      console.log('Error: ' + err)
  });
};

exports.movieToFavs = function(req, res){

  var favObject = new FavsModel({
    _movie:  req.params.movieid,
    userID:  req.params.userid
  });

  favObject.save(function(err){
    if (!err){
      console.log('Movie added to favs.');
      res.send('Movie added to favs.');
    }
    else{
      console.log('There was a problem adding the movie to favs.')
      res.send('There was a problem adding the movie to favs');
    }
  });

};

exports.saveFeedback = function(req, res){

  var feedbackObject = new FeedbackModel({
    _movie : req.params.id,
    movieID: req.params.id,
    type: req.params.type,
    description: req.params.description
  });

  feedbackObject.save(function(err){
    if (!err){
      console.log('Feedback saved');
      res.send('Thanks for your feedback!');
    }
    else{
      console.log('There was a problem saving the feedback.')
      res.send('There was a problem saving the feedback.');
    }
  });
};

exports.getMoviesForFeedback = function(req, res){
  FeedbackModel.find({ }).populate('_movie').sort('-modified').exec(function(err, results){
    if (!err){
      console.log(results);
      res.render('apiFeedbacks', { f:  results });
    }
    else{
      console.log('Error: ' + err);
      res.send('There was a problem getting the feedbacks.');
    }
  });
};

exports.makeAdmin = function(req, res){
  var state = (req.params.state == 'true') ? 'admin' : 'user';
  console.log(state);
  UserModel.update({ 'name': req.params.name }, { $set: { 'role': state } }, function(err){
    if (!err){
      console.log('User "' + req.params.name + '" is now an admin.');
      res.send('User updated.');
    }
    else{
      console.log(err);
      res.send('Error: ' + err);
    }
  });
};

exports.deleteUser = function(req, res){
  UserModel.remove({ 'name': req.params.name }, function(err){
    if (!err){
      console.log('Deleted user "' + req.params.name + '".');
      res.send('User deleted.');
    }
    else{
      console.log(err);
      res.send('Error: ' + err);
    }
  });
};

exports.updateUser = function(req, res){
  UserModel.update({ 'name': req.params.name }, { $set: { 'name': req.body.name, 'email': req.body.email, 'password': req.body.password } }, function(err){
    if (!err){
      console.log('User "' + req.params.name + '" updated.');
      res.send('User updated.');
    }
    else{
      console.log(err);
      res.send('Error: ' + err);
    }
  });
};

exports.updateFeedback = function(req, res){
  MovieModel.update({ '_id': req.params.id }, { $set: { 'url': req.body.url, 'title': req.body.title, 'description': req.body.description, 'genre': req.body.genre, 'poster': req.body.poster, 'posterSmall': req.body.posterSmall, 'posterMedium': req.body.posterMedium, 'rating': req.body.rating, 'releaseDate': req.body.releaseDate, 'format': req.body.format, 'cast': req.body.cast } }, function(err){
    if (!err){
      FeedbackModel.remove({ 'movieID': req.params.id }).populate('_movie').exec(function(err_delete){
        if (!err_delete){
          console.log('Movie "' + req.body.title + '" updated and feedback erased.');
          res.send('Movie updated');
        }
        else{
          console.log('Error: ' + err_delete);
          res.send('Error: ' + err_delete);
        }
      });

    }
    else{
      console.log(err);
      console.log('Error: ' + err);
    }
  });
};

exports.updateMovie = function(req, res){
  MovieModel.update({ '_id': req.params.id }, { $set: { 'url': req.body.url, 'title': req.body.title, 'description': req.body.description, 'genre': req.body.genre, 'poster': req.body.poster, 'posterSmall': req.body.posterSmall, 'posterMedium': req.body.posterMedium, 'rating': req.body.rating, 'releaseDate': req.body.releaseDate, 'format': req.body.format, 'cast': req.body.cast } }, function(err){
    if (!err){
      console.log('Movie "' + req.body.title + '" updated and feedback erased.');
      res.send('Movie updated');
    }
    else{
      console.log('Error: ' + err_delete);
      res.send('Error: ' + err_delete);
    }
  });
};

exports.deleteMovie = function(req, res){
  MovieModel.remove({ '_id': req.params.id }, function(err){
    if (!err){
      console.log('movie deleted');
      res.send('Movie deleted..');
    }
    else{
      console.log('Err: ' + err);
      res.send('Error trying to delete the movie..');
    }
  });
};

exports.deleteFeedback = function(req, res){
  console.log(req.params.id);

  FeedbackModel.remove({ '_id': req.params.id }, function(err){
    if (!err){
      console.log('Feedback removed.');
      res.send('Feedback removed');
    }
    else{
      console.log('Error: ' + err);
      res.send('Error: ' + err);
    }
  });
};

exports.au = function(req, res){
  UserModel.find({ }, function(err, r){
    console.log(r);
  });
};


exports.resetPassword = function(req, res){

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);

    bcrypt.hash(req.params.password, salt, function(err, hash) {
      if(err) return next(err);

      UserModel.update({ '_id': req.params.id, 'resetToken': req.params.token }, {$set: { 'password': hash, 'resetToken': '' }}, function(err){
        if (!err){
          req.flash('info', 'Password reseted!');
          res.redirect('/login')
        }
        else{
          console.log('error reseting password in API: ' + err);
          res.redirect('/');
        }
      });
    });
  });
};
