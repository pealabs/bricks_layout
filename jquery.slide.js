//엘리먼트에 top 값을 구할때 auto로 리턴 되는 것을 방지한다.
jQuery.fn.cssNumber = function cssNumber(prop)
{
    var v = parseInt(this.css(prop),10);
    return isNaN(v) ? 0 : v;
};
var sleep = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
function slider(opt)
{
	var sn = opt.slider; //슬라이더 명
	var cns = opt.contents;//컨텐츠 ul 명
	var cn = opt.content;//컨텐츠 li 명
	var sw = opt.width==0?$('.'+sn).width():opt.width; //슬라이더 뷰어 너비
	var sh = opt.height==0?$('.'+sn).height():opt.height; //슬라이더 뷰어 폭
	var cc = $('.'+cn).length; //컨텐츠  갯수
	var ctw = sw*cc; //컨텐츠 총 길이
	var sp = opt.switchingSpeed; //슬라이드 속도
	var rs = opt.rotationalSpeed; //반복 속도
	var as = opt.autoSlide;//자동 넘기기
	var rmv = opt.right; //오른쪽 이동 버튼 명
	var lmv = opt.left;//왼쪽 이동 버튼 명
	var tc = opt.touch;//터치 사용 여부
	var ar = opt.autoRewind;//되감기 여부
	var nv = opt.navi; //네비게이션 명
	var vw = opt.view //한번에 표시 할 갯수
	var ns = opt.naviSelected //선택된 네비 위치 표시
	var nr = opt.naviRelease //선택안된 네비 위치 표시
	var al = opt.align //슬라이드 정렬
	
	this.run = init
	this.destroy = function() {
			alert ('call destroied');
	};
	function init()
	{
		
		
		$('.'+sn+' ul').css('list-style','none');
		$('.'+sn+' ul').css('padding','0px');
		$('.'+sn+' ul').css('margin','0px auto');
		$('.'+sn+' ul>li').css('list-style','none');
		$('.'+sn+' ul>li').css('padding','0px');
		$('.'+sn+' ul>li').css('float','left');
		
		$('.'+sn).css('overflow','hidden');
		$('.'+sn).css('position','relative');
		$('.'+sn).css('left','50%');
		$('.'+sn).css('margin-left','-'+((sw*vw)/2)+'px');

		$('.'+sn).css('padding','0px');
		$('.'+sn).css('width',(sw*vw)+'px');
		$('.'+sn).css('heigth',sh+'px');
		$('.'+sn).css('z-index','9');

		$('.'+cns).css('width',ctw+'px');
		$('.'+cns).attr('pos',0);
		
		$('.'+cn).css('width',sw+'px');
		$('.'+cn).css('height',sh+'px');
		
		$('.'+rmv).click(function(){
			movement(0);
		})
		$('.'+lmv).click(function(){
			movement(1);
		})
		
	
		//자동 넘기기
		if(as)
		{
			setInterval(function() {
				movement(0);
			}, opt.rotationalSpeed );
		}
		
		//터치 및 마우스 사용 활성화
		if(tc)
		{
			$('.'+sn).bind('touchstart',function(event){touchstart(event);});
			$('.'+sn).bind('touchmove',function(event){touchmove(event);});
			$('.'+sn).bind('touchend',function(event){touchend(event);});
			$('.'+sn).on('mousedown',function(event){touchstart(event);});
			$('.'+sn).on('mousemove',function(event){touchmove(event);});
			$('.'+sn).on('mouseup',function(event){touchend(event);});
		}
		
		//엘리먼트 order granting
		calNavi();
		
		
		$(document).mouseup(function(){
			isMouseDown = false;
		})
	}	

	function calNavi()
	{
		var html = '';
		$('.'+cn).each(function(index)
		{
			$(this).attr('order',index);
			html +='<span class="'+nv+''+index+'">'+opt.naviRelease+'</span>'
		});
		$('.'+nv).html(html);
		$('.'+nv+''+(curl-1)).html(ns);
	}
	var totl = $('.'+cn).length;
	var curl  = 1;
	function selectNavi(cmd)
	{
		$('.'+nv+''+(curl-1)).html(nr);
		
		if(cmd == 0)
		{
			curl = curl+1;
			if(curl > totl)
			{
				curl = 1;
			}
		}
		if(cmd == 1)
		{
			curl = curl-1;
			if(curl == 0)
			{
				curl = totl;
			}
		}
		
		$('.'+nv+''+(curl-1)).html(ns);
		//console.info(curl);
	}
	var stx = null;
	var sty = null;
	var mtx = null;
	var mty = null;
	var etx = null;
	var ety = null;
	var spx = null;
	var spy = null;
	var isMouseDown = false;
	function touchstart(event)
	{
		isMouseDown = true;
		event.preventDefault();
		var e = event.originalEvent;
		stx = e.pageX || e.targetTouches[0].pageX;
		sty = e.pageY || e.targetTouches[0].pageY;

	}
	function touchmove(event)
	{
		if(isMouseDown)
		{
			event.preventDefault();
			var e = event.originalEvent;
			mtx = e.pageX || e.targetTouches[0].pageX;
			mty = e.pageY || e.targetTouches[0].pageY;
			
			$('.'+sn).scrollLeft(Number($('.'+cns).attr('pos'))+(stx-mtx))
		}
	}
	function touchend(event)
	{
		event.preventDefault();
		var e = event.originalEvent;
		etx = e.pageX || e.changedTouches[0].pageX;
		ety = e.pageY || e.changedTouches[0].pageY;

		var center = (sw*vw)/2;
		
		var correction = $('.'+sn).cssNumber('left');
		center = correction;
	
		if((stx-etx)<0)
		{
			if(etx>center)
			{
				//console.info('좌에서 우로 넘어감');
				movement(1);
			}
			if(etx<center)
			{
				//console.info('좌에서 우로 안넘어감');
				$('.'+sn).animate({
					scrollLeft:Number($('.'+cns).attr('pos'))
				},sp,function(){});
			}
		}
		if((stx-etx)>0)
		{
			if(etx<center)
			{
				movement(0);
				//console.info('우에서 좌로 넘어감');
			}
			if(etx>center)
			{
				//console.info('우에서 좌로 안넘어감');
				$('.'+sn).animate({
					scrollLeft:Number($('.'+cns).attr('pos'))
				},sp,function(){});
			}
		}
	}
	function movement(cmd)
	{
		//console.info($('.'+cns).attr('pos'));
		var mv = 0;

		if(cmd==0)
		{
			if(ar && Number($('.'+cns).attr('pos'))==(ctw-(sw*vw)))
			{
				$('.'+cn).last().after($('.'+cn).first());
				var re = Number($('.'+cns).attr('pos'))-sw;
				$('.'+sn).scrollLeft(re);
				$('.'+cns).attr('pos',$('.'+sn).scrollLeft());	
			}
			mv = Number($('.'+cns).attr('pos'))+sw;	
			
		}
		if(cmd==1)
		{
			if(ar && Number($('.'+cns).attr('pos'))==0)
			{
				$('.'+cn).first().before($('.'+cn).last());
				var re = Number($('.'+cns).attr('pos'))+sw;
				$('.'+sn).scrollLeft(re);
				$('.'+cns).attr('pos',$('.'+sn).scrollLeft());	
			}
			mv = Number($('.'+cns).attr('pos'))-sw;
		}
		
		selectNavi(cmd);
		
		//이동
		$('.'+sn).animate({
			scrollLeft:mv
		}, sp, function() {
			//현재 위치
			$('.'+cns).attr('pos',$('.'+sn).scrollLeft());
			if(ar)
			{
				if(mv==(ctw-(sw*vw)) && cmd==0){
					$('.'+cn).last().after($('.'+cn).first());
					var re = Number($('.'+cns).attr('pos'))-sw;
				}
				if(mv==0 && cmd==1){
					$('.'+cn).first().before($('.'+cn).last());
					var re = Number($('.'+cns).attr('pos'))+sw;
				}
				$('.'+sn).scrollLeft(re);
				$('.'+cns).attr('pos',$('.'+sn).scrollLeft());
				
			}
		});
	}
}