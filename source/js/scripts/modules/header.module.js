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

	var createHeader = function(layer, config, type) {
		var template = "<div class='ml-header ml-header-"+type+"'>"+config.template+"</div>";

		var titleWrapper, back, home;

		var backbutton = "";

		if(JSON.parse(config.buttons.back)) {
			back = "<a href='javascript:void(0)' class='ml-close'>Back</a>";
			backbutton = "<div class='ml-buttons ml-buttons-left'>"+back+"</div>";
		}
		template = template.replace('{{back}}', backbutton);

		var homeButton = "";
		if(JSON.parse(config.buttons.home)) {
			// <a data-target="#layer2" class="ml-open">Layer2</a>
			home = "<a class='ml-open' href='#"+Strata.config.homeLayer+"'>Home</a>";
			homeButton = "<div class='ml-buttons ml-buttons-right'>"+home+"</div>";
		}
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
		if(elementConfig['config-header-buttons-back'] === "false") itemConfig.buttons.back = false;
		if(elementConfig['config-header-buttons-home'] === "false") itemConfig.buttons.home = false;
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
				}
			},
			'openStart': function(Layer) {
				Layer = Layer.layer;
				if(Layer.config.header.type === 'layer') {
					$HTML.removeClass('ml-header-opened');
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
				}
			}
		},
		'init': function(config){
			console.log('Module header', config);
		}
	};
}(Strata));