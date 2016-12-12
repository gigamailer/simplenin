cDownload = Class.create(
{
	freeslot: false,
	initialize: function(free_enabled)
	{
		var c = this.c();
		
		this._auth = c.down('h1 a').href.substr(c.down('h1 a').href.lastIndexOf('/')+1);
		
		this.blink();

		if(Object.isUndefined(free_enabled))
			var free_enabled = true

		if(free_enabled)
			c.down('button.free').observe('click', this.free.bind(this));
		else
			c.down('button.free').observe('click', this.noDL.bind(this));
    },

	c: function(){ return $('content'); },
	
	noDL: function(){
		Uploader.ol({fixed:true,html:'<div style="position:relative;margin:10px 40px 5px;line-height:22px" class="aL">'
			+'	<div style="float:left;width:70px;height:75px;margin:19px 45px 0 10px;background:url(img/e/download.png) -1px -178px"></div>'
			+'	<div class="vborder" style="float:left;height:114px;margin-right:20px"></div>'
			+'	<h1 style="font-size:22px;margin-bottom:20px">All of our free-download capacities are exhausted currently.</h1>'
			+'	<div>Please <a href=\'register\'>get a Premium Account</a> if you want to download this file immediately, otherwise you\'ll have to wait a few minutes in order to download this file.</div>'
			+'	<div id="limitcd" style="margin-top:5px" class="cL">You\'ll be redirected to the <a href=\"register\">register site</a> in <span class=\"redirect\">15</span> seconds&hellip;'
			+'</div>'});
		
		$('ol').setStyle('width:850px;height:160px');
		$$('body')[0].setStyle('overflow-x:hidden');
		this.redirectCountdown();
	},
	
	redirectCountdown: function(){
		setTimeout(function(){
			var elem = $('limitcd');
			if(!elem) return;
			var sec	= parseInt(elem.down('span').innerHTML)-1;
			
			if(sec > 0)
				elem.down('span').update(sec);
			
			if(sec == 0)
				return top.location.href = 'register';
			
			this.redirectCountdown();
		}.bind(this), 1000);
	},

	_blink: false,
	blink: function(hover)
	{
		if (!this._blink) {
			return;
		}

		var c = this.c().down('button.prem').up('td');
		if(!c.down('button')) {
			return;
		}
		
		setTimeout(this.blink.bind(this), 900);

		if(c.hasClassName('blink')) {
			c.removeClassName('blink').select('button, h1').invoke('morph', 'color:#b5dbf0', {duration: .1}).invoke('setStyle', {textShadow: '#0a4976 0 -1px 0'});
		} else {
			c.addClassName('blink').select('button, h1').invoke('morph', 'color:#fff', {duration: .9}).invoke('setStyle', {textShadow: '#082f5e 0 1px 2px'});
		}

	},
	
	free: function()
	{
		var b = this.c().down('button.free');

		if (typeof window.adShareVideoOptions != "undefined" && typeof window.adshareVideoAd != "undefined") {
			window.adshareVideoAd(window.adShareVideoOptions);
		}
		
		b.stopObserving();
		b.down('h1').update('Processing&hellip;&hellip;');
		b.up().select('button, h1').invoke('setStyle', {cursor:'default',color:'#fff',textShadow:'#555 0 0 3px,#fff 0 0 7px'}).invoke('morph', 'color:#ffffaa', {duration:.5});

		new Ajax.Request('io/ticket/slot/'+this._auth, {onComplete:function(t){
				t = t.responseText.evalJSON();
				if(t.err) {
					this.freeslot = false;
				} else {
					this.freeslot = true;
				}
		}.bind(this)});

		setTimeout(this.countdown.bind(this), 1000);
	},

	start: function(t)
	{
		if(!t.responseText)
			return;

		var e = t.responseText.evalJSON();

		if(e.err.substr(0, 5) == 'limit')
			this.limit(e.err.substr(6));
		else
			$('captcha').update('<div style="margin:10px 20px 0 0">' +
				'<span class="error">'+e.err+'</span></div>');
	},

	limit: function(limit)
	{
		if(limit == "host"){
			var s = window.document.location.href.substring(window.document.location.href.indexOf('file/')+5);
			if(s.indexOf('/')) s = s.substring(0,s.indexOf('/'));
			window.document.location.href = "dl/"+s;
			return;
		}

		var c = $('captcha');
		var err = {dl:'You\'ve reached your Free account limit. In order to be able to proceed downloading you need a Premium account.',
				   parallel:'You\'re already downloading.To download simultaneously you need a Premium account.',
				   size: 'Only Premiumusers are allowed to download files lager than 1,00 GB.',
				   slot:'The free download is currently not available - Please try again later! <b>Premium account users are not affected by this temporary limitation</b>.'};
		c.morph('height:120px', {duration:.3,afterFinish:function(){
			c.update('<div style="margin:10px 20px 0 0">' +
				'<span class="error">'+(err[limit])+'</span>' +
				'' +
				'<p class="cL"><small>You\'ll be redirected to the <a href=\"register\">register site</a> in <span class=\"redirect\">10</span> seconds&hellip;</small></p></div>');
			c.down('div').pulsate({duration:.4,pulses:3});
			this.redirect();
		}.bind(this)});
	},
	
	redirect: function()
	{
		var c = $('captcha').down('.redirect');
		var v = parseInt(c.innerHTML)-1;
		
		if(c && v>0)
			c.update(v);
		else
			return window.location.href = 'register';
		
		setTimeout(this.redirect.bind(this), 1000);
	},
	
	countdown: function()
	{
		if(!this.c().down('button.free span span')) return;
		
		var t = parseInt(this.c().down('button.free span span').innerHTML);
		
		if(t <= 1)
			return this.checkslots();	//return this.captcha(); 
		else
			t--;
		
		this.c().down('button.free span').update('Wait <span>%s</span> seconds&hellip;'.sub('%s', t));
		
		setTimeout(this.countdown.bind(this), 1000);
	},

    urldecode: function(str) {
        // http://kevin.vanzonneveld.net
        return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function () {
            return '%25';
        }).replace(/\+/g, '%20'));
    },

    addslashes: function (str) {
        // http://kevin.vanzonneveld.net
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    },

	captcha: function(wrong)
	{
		
		 //if(!$('downloadOld')) return;
		
		if(!Recaptcha)
			return setTimeout(this.captcha.bind(this), 10);
		
		var c = $('captcha');
		//c.setStyle('height:131px');
		c.morph('height:131px', {duration:.3,afterFinish:function(){

						c.update('<form method="post" action="io/ticket/captcha/'+this._auth+'"><div></div></form>');
			
			c.down('form').observe('submit', this.send.bind(this));
			Recaptcha.create("6Lcqz78SAAAAAPgsTYF3UlGf2QFQCNuPMenuyHF3 ",
			    c.down('form div'),
			    { theme: (wrong?'red':'white'),
			      callback: Recaptcha.focus_response_field }
			  );
			//c.down('form button').appear({duration:1}).morph('height:27px',{duration:.6});
            //c.down('form').insert({bottom:'<a id="fasterspeed" style="height:0px;overflow:hidden;margin-left:48px;" target="_blank" href="http://r.lumovies.com/87/'+filename+'">Faster Speed</a>'});
		}.bind(this)});
		

		c.observe('keyup',function(){
			c.stopObserving();
			var button = '<button id="download_button" class="captcha" type="submit" style="height:27px;overflow:hidden;margin-left:18%;">Download</button>';
			c.down('form').insert({bottom: button});
			
			//c.down('form button').appear({duration:1}).morph('height:27px',{duration:.6});
            //c.down('form').insert({bottom:'<div id="fasterspeed" style="height:24px; overflow:hidden;margin-left:48px;font-size:11px;font-weight:bold;" onClick="window.open(\'http://r.lumovies.com/87/'+filename+'\')">Faster Speed</a>'});
            //c.down('fasterspeed').appear({duration:1}).morph('height:27px',{duration:.6});
		}.bind(this));
	},
	
	checkslots: function() {
		if(this.freeslot) {
			this.captcha();
			//$('captcha').update('<form method="post" action="io/ticket/captcha/'+this._auth+'"><button class="free" style="margin-right:0px;"><h1>Download Starten</h1><span style="">Sie können Ihren Download starten</span></button></form>')
			//$('captcha').down('form').observe('submit', this.send.bind(this));
		} else {
			this.limit("slot");
		}
			
	},
	
	send: function(e)
	{
		e.stop();

		if($('recaptcha_response_field').getValue() == '')
			return Uploader.alert('Please solve the captcha');
		
		e.element().fade({duration:.6});
		e.element().request({onComplete:function(t){
			t = t.responseText.evalJSON();

			if(t.err && t.err == 'captcha')
			{
				e.element().appear({duration:.3});
				e.element().setStyle({background:'#f00'}).morph('background:#ffffff', {duration:2}).down('.recaptcha_image_cell').setStyle({background:'#ffffff'});
				tracking_method = 'forcesale';
				return;
			}
			else if(t.err && t.err.substr(0, 5) == 'limit')
			{
				tracking_method = 'forcesale';
				return this.limit(t.err.substr(6));
			}				

			if(t.url)
			{
                                window.downloadstarted = true;
                $('captcha').update('<span class="cG"><img src="/img/l/fb.gif" style="margin:0 7px -1px 10px" /> starting download&hellip;</span>');

				window.location.href = t.url;

				return;
			}
			tracking_method = 'forcesale';
			return $('captcha').update('<div style="margin:10px 20px 0 0">' +
				'<span class="error">'+(t.err?t.err:'Unknown error')+'</span></div>');
			
			
		}.bind(this)});
	},

	verifyCaptcha: function(cb){

		if (!$('recaptcha_response_field').getValue()) {
			return Uploader.alert('Please solve the captcha');
		}

		new Ajax.Request('io/ticket/captcha/' + this._auth, {
			parameters: 'recaptcha_response_field=' + $('recaptcha_response_field').getValue() + '&recaptcha_challenge_field=' + $('recaptcha_challenge_field').getValue(),
			onComplete: function (t) {
				t = t.responseText.evalJSON();
				if (t.err && t.err == 'captcha') {
					$('captcha').down('form div').appear({duration:.3});
					$('captcha').down('form div').setStyle({background:'#f00'}).morph('background:#ffffff', {duration:2}).down('.recaptcha_image_cell').setStyle({background:'#ffffff'});
					return;
				} else if(t.err && t.err.substr(0, 5) == 'limit') {
					return this.limit(t.err.substr(6));
				}

				if(t.url)
				{
					cb(t);
					$('captcha').update('<span class="cG"><img src="/img/l/fb.gif" style="margin:0 7px -1px 10px" /> starting download&hellip;</span>');
					return ;
				}

			}.bind(this)
		});

	}

});

if(!Recaptcha) var Recaptcha = null;
var Download = new cDownload(free_enabled);
