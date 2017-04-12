/**
 *	Layers
 */

(function (window) {
	// var __mLayersList = __mLayersList || {};

	var _opened = false;
	// Helpers
	var GenerateID = function(prefix) {
		return prefix+'_'+Math.round(new Date().getTime() + (Math.random() * 100000));
	};

	var LayerException = function(message) {
		this.message = message;
		this.name = 'LayerException';
	};

	var LayerController = function(config) {
		if(typeof config !== 'object') return false;
		this.id = false;
		this.element = false;
		this.active = false;
		this.opened = false;
		this.last = false;
		this.config = config;
	};

	LayerController.prototype.create = function(element) {
		if(this.id !== false) return;
		if(typeof element === 'string') {
			var targetElement = $(element);
			if(targetElement.length < 1) throw new LayerException('Invalid object id:'+ element);
			element = targetElement;
		}

		if(element.length < 0) throw new LayerException('Invalid object:'+ element);

		// get or set ID
		var elementId = element.attr('id');
		if(elementId === 'undefined') elementId = GenerateID('mlayer');
		this.id = elementId;

		// if(typeof __mLayersList[this.id] === 'object') return;
		var fadeInClass = 'ml-' + this.config.layer.type +'-'+ this.config.layer.position;
		var typeClass = 'ml-' + this.config.layer.type;

		var newLayerContent = $('<div>', {'class':'ml-layer-content'}).html(this.config.layer.template.replace('{{content}}', element.html()));
		var newLayer = $('<div>', {
			'class':'ml-layer '+ element.attr('class')+ ' '+typeClass+' ' +fadeInClass, 
			'id': this.id
		}).html(newLayerContent);

		element.remove();

		this.element = newLayer;
		this.config.parent.append(this.element);
		// __mLayersList[this.id] = this;
	};


	// set active layer as opened
	LayerController.prototype.setOpened = function() {
		var current = LayersController.getOpened();
		if(typeof current === 'object') current.opened = false;
		// LayersController.getOpened().opened = false;
		this.opened = true;
		_opened = this.id;
	};

	// set as last item opened
	LayerController.prototype.setLast = function() {
		var current = LayersController.getLast();
		if(typeof current === 'object') current.last = false;
		// LayersController.getOpened().opened = false;
		this.last = true;
	};

	LayerController.prototype.open = function() {
		var _this = this;
		if(_opened === _this.id) return; // dont do anything if layer is current opened and active
		// set html class for basis of animating
		$('html').removeClass('ml-offcanvas ml-popup ml-split').addClass('ml-'+_this.config.layer.type);

		// close opened panel
		// if(typeof __mLayersList[ _opened ] === 'object') {
		// 	__mLayersList[ _opened ].close();
		// }
		// var last = LayersController.getLast();
		// console.error('error', last);
		// if(last && last.id !== _this.id) last.close();

		// set opened
		// _opened = _this.id;

		_this.setOpened();

		// do reset first
		// @TODO Move to private function
		// @TODO can now be removed
		// $('html').addClass('ml-reset');
		// setTimeout(function(){
		// 	$('html').removeClass('ml-reset').addClass('ml-opening');
		// },1);

		_this.element.trigger('beforeOpen', _this);
		_this.element.removeClass('ml-last').addClass('ml-target ml-opening');

		setTimeout(function(){
			_this.element.removeClass('ml-target ml-opening');
			_this.element.trigger('afterOpen', _this);
			// $('html').removeClass('ml-opening').addClass('ml-opened');
		},_this.config.animation.time);
	};

	// var REMOVEALLLASTOPENEDITEMS = function(){
	// 	$.each(__mLayersList, function(e,item){
	// 		item.element.removeClass('ml-last');
	// 	});
	// };

	LayerController.prototype.close = function() {
		console.log('close', this);
		var _this = this;
		_this.element.trigger('beforeClose', _this);
		_this.element.removeClass('ml-active').addClass('ml-closing');

		setTimeout(function(){
			_this.element.removeClass('ml-closing');
			_this.setLast();
			_this.element.trigger('afterClose', _this);
		},_this.config.animation.time);
	};

	window.LayerController = LayerController;

}(window));