(function(Strata){
	var _siteHeaderInited = false, $HTML = $('html'), siteHeader;
	var createTitle = function(layer,config) {
		var title = config.title;
		if(!title) title = layer.id;
		return "<div class='ml-title' data-layer='"+layer.id+"'>"+title+"</div>";
	};
	var addHeaderTitle = function(layer, config){
		if(config.type === 'site'){
			var title = "<div class='ml-title' data-layer='"+layer.id+"'>"+config.title+"</div>";
			Strata.config.parent.find('.ml-header-site .ml-title-container').append(createTitle(layer, config));
		}
	};

	// buttons options
	var backButton = function(text) {
		return $('<a>', {'class':'ml-button ml-close','href':'javascript:void(0)'}).html(text);
	};

	var openButton = function(link,text) {
		return $('<a>', {'class':'ml-button ml-open','href':link}).html(text);
	};

	var createHeader = function(layer, config, type) {
		var template = "<div class='ml-header ml-header-"+type+"'>"+config.template+"</div>";

		var titleWrapper, back, home;

		// var backbutton = "";

		// if(config.buttons.back) {
		// 	back = "<a href='javascript:void(0)' class='ml-close'>Back</a>";
		// 	backbutton = "<div class='ml-buttons ml-buttons-left'>"+back+"</div>";
		// }
		var backbutton = "<div class='ml-buttons ml-buttons-left'></div>";
		template = template.replace('{{back}}', backbutton);

		// var homeButton = "";
		// if(config.buttons.home) {
		// 	// <a data-target="#layer2" class="ml-open">Layer2</a>
		// 	home = "<a class='ml-open' href='#"+Strata.config.homeLayer+"'>Home</a>";
		// 	homeButton = "<div class='ml-buttons ml-buttons-right'>"+home+"</div>";
		// }
		var homeButton = "<div class='ml-buttons ml-buttons-right'></div>";
		template = template.replace('{{home}}', homeButton);

		var title = config.title;
		if(!config.title) {
			title = layer.id;
		}
		
		titleWrapper = "<div class='ml-title-container'>"+createTitle(layer, config)+"</div>";
		
		template = template.replace('{{title}}', titleWrapper);

		return template;
	};

	var getAvailableElementConfig = function(elementConfig, itemConfig){
		if(elementConfig['config-header-title']) itemConfig.title = elementConfig['config-header-title'];
		if(elementConfig['config-header-buttons-right']) itemConfig.buttons.right = elementConfig['config-header-buttons-right'];
		if(elementConfig['config-header-buttons-left']) itemConfig.buttons.left = elementConfig['config-header-buttons-left'];
		return itemConfig;
	};

	Strata.modules.header = {
		'layer': {
			'createEnd': function(params) {
				var layer = params.layer;
				var headerConfig = layer.config.header;
				if(!headerConfig.enable) return;

				var elementConfig = Strata.getElementConfig(layer.element);
				// console.log('test', elementConfig);
				var newConfig = getAvailableElementConfig(elementConfig, headerConfig);
				
				if(newConfig.type === 'site') {
					if(_siteHeaderInited) {
						addHeaderTitle(layer,newConfig);
					} else {
						Strata.config.parent.prepend(createHeader(layer,newConfig,'site'));
						_siteHeaderInited = true;
					}
					layer.element.addClass('ml-header-enabled');
				} else {
					layer.element.prepend(createHeader(layer,newConfig,'layer'));
					layer.element.addClass('ml-has-header');
				}
			},
			'openStart': function(Layer) {
				Layer = Layer.layer;
				var headerRight, headerLeft;

				if(Layer.config.header.type === 'layer') {
					$HTML.removeClass('ml-header-opened');
					headerRight = Layer.element.find('.ml-header-layer .ml-buttons-right');
					headerLeft = Layer.element.find('.ml-header-layer .ml-buttons-left');
				} else {
					$HTML.addClass('ml-header-opened');
					var $SiteHeader = Strata.config.parent.find('.ml-header-site');
					var lastTitle = $SiteHeader.find('.ml-title.ml-title-active');

					$SiteHeader.find('.ml-title').each(function(e,elem){
						if(Layer.id === $(this).attr('data-layer')) {
							$(this).addClass('ml-title-active').removeClass('ml-title-opened');
						}else{
							$(this).removeClass('ml-title-active');
						}
					});

					if(lastTitle && $HTML.is('.ml-next')) lastTitle.addClass('ml-title-opened');

					if(Layer.id === Strata.config.homeLayer) {
						$SiteHeader.addClass('ml-header-home');
					} else {
						$SiteHeader.removeClass('ml-header-home');
					}
					headerRight = $SiteHeader.find('.ml-buttons-right');
					headerLeft = $SiteHeader.find('.ml-buttons-left');
				}

				// reset buttons

				headerLeft.html('');
				headerRight.html('');
				var leftButton = '', rightButton = '';
				if(Layer.config.header.buttons.left != 'false') {
					console.error('buttons', headerLeft);
					leftButton = eval(Layer.config.header.buttons.left);
					headerLeft.html(leftButton);
				}

				if(Layer.config.header.buttons.right != 'false') {
					rightButton = eval(Layer.config.header.buttons.right);
					headerRight.html(rightButton);
				}
			}
		},
		'init': function(config){
			console.log('Module header', config);
		}
	};
}(Strata));