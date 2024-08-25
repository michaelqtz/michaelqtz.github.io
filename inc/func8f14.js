function sform(name) {
    if (typeof name == 'object') {
        name = $(name).closest('form').attr('name');
    }
    var rid = $('form[name='+name+']').attr('action');
    block($('form[name='+name+']'),0.4);
    $.ajax({data:{rid:rid,ajax:name,data:form_data(name)}}).done(function(data) {
		block($('form[name='+name+']'),1.0);
		if (data && form_error(name,data.err)) {
    		return false;
		}
		if (data.callback) return window[data.callback](data);
		else if (data.url) window.location.href = data.url;
		else if (data.wms) {
    		wmsc();
    		wms2(data.wms);
        }
		else wmsc();
	});
	return false;
}
function form_data(name) {
    var data = {};
    var n = 0;
    var k = '';
    var v = '';
    $('form[name='+name+'] .input').each(function(){
        n = $(this).attr('rel')-0;
        k = $(this).attr('name');
        if ($(this).prop('type') == 'checkbox') {
            v = ($(this).prop('checked') ? $(this).val() : 0);
            //if (!v) return;
        }
        else if ($(this).prop('type') == 'radio') {
            v = ($(this).prop('checked') ? $(this).val() : 0);
            if (!v) return;
        }
        else {
            if ($(this).hasClass('tiny')) {
                v = tinyMCE.get(k).getContent()
            }
            else {
                if (!$(this).prop('type')) return;
                v = $(this).val();
            }
        }
        if (n > 0) {
            if (!data[n]) data[n] = {};
            if (typeof data[n][k] != 'undefined') {
                if (typeof data[n][k] == 'string' || typeof data[n][k] == 'number') data[n][k] = [data[n][k]];
                data[n][k].push(v);
            }
            else {
                data[n][k] = v;    
            }
        }
        else {
            if (data[k]) {
                if (typeof data[k] == 'string' || typeof data[k] == 'number') data[k] = [data[k]];
                data[k].push(v);
            }
            else {
                data[k] = v;    
            }
        }
    });
            
    if ($('#captcha').html()) {
        data['captcha'] = grecaptcha.getResponse();
    }
    return data;
}
function form_error(name, err) {
    $('form[name='+name+'] div').removeClass('has-error');
    $('form[name='+name+']').find('p.help-block').remove();
    if (!err) return false;
    var txt = '<ul>';
    for(var i in err) {
        $('form[name='+name+'] div[rel="'+i+'"]').addClass('has-error').append('<p class="help-block">'+err[i]+'</p>');
        $('form[name='+name+'] div[rel="'+i+'"] .input').shake();
        txt += '<li>'+err[i]+'</li>';
    }
    if (err['captcha'] && $('#captcha').html() == '') {
        grecaptcha.render('captcha',{'sitekey': '6LfFgO4SAAAAAEwiDKQb5i0NhuonBlCMk1khYcAA'});
    }
    txt += '</ul>';
    wms2(txt);
    return true;
}

function wms(title, text) {
    var txt = '';
    if (title != '') txt += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">'+(title != '' ? title : 'ONGAB.ru')+'</h4></div>';
    txt += '<div class="modal-body">'+text+'</div>';
    $('#wms .modal-content').html(txt);
    $('#wms').modal();
}
function wms2(text) {
    $('#wms2 .wms-message').html(text);
    $('#wms2').show(100).delay(4000).hide(400);
}
function wmsc() {
    $('#wms .modal-content').html('');
    $('#wms').modal('hide');
    $('#wms2 .wms-message').html('');
    $('#wms2').hide();
}
function wmsc3(id) {
    $.ajax({data:{rid:'notice',ajax:'read',data:{'id':id,'last':$('#ntl').val()}}}).done(function(data) {
        if (id) {
            $('.wms-don[rel='+id+']').remove();
            if (data.n != '') {
                var txt = '<div class="wms-don rub'+data.n.class+'" rel="'+data.n.id+'">';
                txt += '<div class="wms-don-header"><span class="wms-close-button" onclick="wmsc3('+data.n.id+')">×</span>';
                txt += '<a class="don-all-link odtip" title="Все доходы пользователей" href="/donate">'+data.n.kol+'<b>руб</b></a>';
                txt += '<div class="wms-don-title">'+data.n.descr+'</div></div>';
                txt += '<div class="wms-don-inner"><div class="wms-don-message">'+data.n.txt+'</div></div></div>';
                $('#nts').append(txt);
                $('#ntl').val(data.n.id);
            }
            else if (!$('#nts .wms-don').length) $('.wms-don-div').remove();
        }
        else {
            $('.wms-don-div').remove();
        }
    });
}

function mfilter(f,eng) {
    $('#filter input').each(function(){
        if ($(this).attr('name') == f) {
            $(this).val(eng);
        }
    });
    $('#filter').submit();
}

function block(e, k) {
    $(e).css('opacity',k);
}

function get_hide(id) {
	var ah = $('#hide'+id).parent().find('a.h_sp_tog');
	if (ah.attr('class') != 'h_sp_tog odtip') {
		$('#hide'+id).html($('#hide'+id).parent().attr('alt'));
		ah.removeClass('hon');
	}
	else {
		$.ajax({data:{rid:'hide',ajax:'get_hide',data:{'id':id}}}).done(function(data){
			if (data.err) wms2(data.err);
			else {
				$('#hide'+id).html(data.txt);
				ah.addClass('hon');
			}
		});
	}
}

function loader() {
    $('.loader').each(function(){
        var t = $(this).attr('data-title');
        if (t) {
            var n = $(this).attr('data-input');
            var r = $(this).attr('data-rel');
            var c = $(this).attr('data-callback');
            var uploader = new qq.FineUploader({
                element: $(this)[0],
                classes: {
                    button: 'button-'+t+r
                },
                request: {
        		    endpoint: '/file?name='+t,
    			    rel: r,
    			    name: n,
    			    title: t,
    			    callback: c
                },
                validation: {
                    sizeLimit: 10000000,
                    count: $(this).attr('data-count')
                }
            });
        }
    });
}

function pics() {
    if ($('.flex-images').length) {
    	$('.flex-images').each(function(){
        	var container = $(this);
        	var imgs = container.find('img');
            var totalImgs = imgs.length;
            var cnt	= 0;
        	imgs.each(function(i) {
        		var img = $(this);
        		$('<img/>').load(function() {
        		    ++cnt;
        		    if (cnt === totalImgs) {
                        imgs.show();
                        container.montage({
                            liquid 	: true,
                            fillLastRow : true,
                            fixedHeight: 150,
                            margin: 3
        		        });
        		    }
        		}).attr('src',img.attr('src'));
            });
    	});
	}
}

function picsSmall() {
    if ($('.flex-images').length) {
    	$('.flex-images').each(function(){
        	var container = $(this);
        	var imgs = container.find('img');
            var totalImgs = imgs.length;
            var cnt	= 0;
        	imgs.each(function(i) {
        		var img = $(this);
        		$('<img/>').load(function() {
        		    ++cnt;
        		    if (cnt === totalImgs) {
                        imgs.show();
                        container.montage({
                            liquid 	: true,
                            fillLastRow : true,
                            fixedHeight: 50,
                            margin: 3
        		        });
        		    }
        		}).attr('src',img.attr('src'));
            });
    	});
	}
}

function tips() {
    $('.odtip').tooltip({
        'html': true,
        'container':'body'
    });
    $('a.fancybox').fancybox({
		helpers		: {
			title	: { type : 'inside' },
			buttons	: {},
			thumbs	: {
				width	: 50,
				height	: 50
			}
		}
	});
	$('div.com-body a').fancybox({
		helpers		: {
			title	: { type : 'inside' },
			buttons	: {},
			thumbs	: {
				width	: 50,
				height	: 50
			}
		}
	});
    $('.video').fancybox({
		arrows : false,
		beforeLoad : function() {
			var f = this;
			if ($(this.element).attr('longdesc') !== undefined) f.href = $(this.element).attr('longdesc');
			else f.href = $(this.element).attr('href');
		},
		helpers : {
			title : { type : 'inside' },
			media : {}
		}
	});
    
    $(".video2").fancybox({
            maxWidth	: 1200,
            maxHeight	: 800,
            fitToView	: false,
            width		: '80%',
            height		: '80%',
            autoSize	: false,
            closeClick	: false,
            openEffect	: 'none',
            closeEffect	: 'none'
        });
}

$(document).ready(function() {
	//error pics
    $('img').error(function() {
        $(this).attr({
			src: '/html/img/errorpic.gif'
        });
    });
    if ($(window).width() < 728){
        $('.username > a').removeAttr("href");
    }
    if ($(window).width() > 1600){
        $('#wrapper').addClass('toggled');
    }   
    $('.hasSubmenub').click(function() {
        $(this).parent().find('.sidebar-sub-nav').toggleClass('active');
    });
	$.ajaxSetup({
        type: 'POST',
        dataType: 'json'
    });
	$('a.wms').click(function() {
        wms($(this).html(), $(this).prop('title'));
    });
    if ($('#wms2 .wms-message').html() != '') {
        wms2($('#wms2 .wms-message').html());
    }
    if ($('#wms .modal-content').html() != '') {
        wms('', $('#wms .modal-content').html());
    }
    
    $('#menu-toggle').click(function() {
		$('#wrapper').toggleClass('toggled');
	});
    
    $('.mobileshadow').on('click', function() {
		$('#wrapper').toggleClass('toggled');
	});

    $('.bcl').click(function() {
		$(this).parent().hide();
	});
	
    tips();
    
    $.fn.shake = function () {
        var pos;
        return this.each(function () {
            pos = $(this).css('position');
            if (!pos || pos === 'static') {
                $(this).css('position', 'relative');
            }
            for (var x = 1; x <= 3; x++) {
                $(this).animate({left: -2}, 17).animate({left: 2}, 34).animate({left: 0}, 17);
            }
        });
    };
    
    $.fn.visible = function(partial){
	    var $t				= $(this),
	    	$w				= $(window),
	    	viewTop			= $w.scrollTop(),
	    	viewBottom		= viewTop + $w.height(),
	    	_top			= $t.offset().top,
	    	_bottom			= _top + $t.height(),
	    	compareTop		= partial === true ? _bottom : _top,
	    	compareBottom	= partial === true ? _top : _bottom;
		
		return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
    };
});