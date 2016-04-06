var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/api');

var Cat = mongoose.model('Cat', { name: String });

// var kitty = new Cat({ name: 'Zildjian' });
// kitty.save(function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('meow');
//   }
// });


Cat.find(function (err, results) {
  if (err) {
    console.log(err);
  } else {
    console.log(results);
  }
});





setTimeout(function(){
	process.exit();
},1500);