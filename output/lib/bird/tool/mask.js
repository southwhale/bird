define(function(require) {
	var Mask = require('bird.ui.mask');

	var _mask = new Mask();
	_mask.render();
	_mask.insertBefore(document.getElementById('viewWrapper'));
	return _mask;
});