var wws = 0; //윈도우 가로 사이즈
var bws = 240; //벽돌 가로 사이즈
var nl = 0; //윈도우 가로 사이즈를 벽돌 가로사이즈로 나눔 (소수점 버림)
var rows = new Array(); //추출된 row 값 배열
var row = new Array(); //추출된 벽돌 아이디 값 배열
var align = 'center'; 
var bricks = new Array();
var options = new Array();

//엘리먼트에 top 값을 구할때 auto로 리턴 되는 것을 방지한다.
jQuery.fn.cssNumber = function cssNumber(prop)
{
    var v = parseInt(this.css(prop),10);
    return isNaN(v) ? 0 : v;
};
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();


function create(opt)
{	

	$('body').css('overflow-x','hidden');
	$('body').css('overflow-y','scroll');
		
	console.info('----------시작------------');
	//디스플레이 할 영역의 가로 사이즈 구하기
	wws = $('.masonry').width();

	if(opt.column>0)
	{
		bws = wws/opt.column;
	}
	else if(opt.width>0)
	{
		bws = opt.width;
	}
	
	console.info('디스플레이 할 가로 사이즈 : '+wws);
	
	/////////
	//디스플레이 할 영역의 가로 사이즈 안에 몇개의 벽돌을 놓을지 계산
	nl = Math.floor(wws/bws);

	////custom/////
	//$('.masonry').css('width',(bws*nl)+'px');
	//$('.masonry').css('margin','0 auto');
	////custom/////
	$(window).resize(function() {
		delay(function(){
			wws = $('.masonry').width();
		    ////custom/////
			create({
				width:0
				,column:wws<700?2:4
			});	
		}, 300);
	});
	
	
	//var masonry_width = nl*bws;
	//$('.masonry').css('width', masonry_width);
	//$('.masonry').css('margin', '0px auto');
	
	console.info('한행에 들어갈 벽돌 수 : '+nl);
	console.info('-------------------------');
	//벽돌 분석
	brickAnalysis();
	
	//벽돌 생성
	printBricks();

	//재정렬(수직으로 빈 공간만큼 당기기)
	relocation();

}
function printBricks()
{
	console.info('--------벽돌 생성--------');
	console.info('총 '+rows.length+' 행이 표시 됩니다');
	console.info('행 당 표시할 벽돌 수 : '+nl);
	var bricks_html = '';
	
	//벽돌 내용이 자리 만듦
	$(rows).each(function(rows_index)
	{
		var row = rows[rows_index];
		//console.info(row);
		$(row).each(function(row_index)
		{
			//console.info(row[row_index]);	
			bricks_html += '<div id="'+row[row_index]+'" class="bricks"></div>';
			
			if((row_index+1)%nl==0)
			{
				bricks_html += '<div class="newline" style="clear:both;"></div>';
			}
		})

	})
	//벽돌 그리기
	$('.masonry').html(bricks_html);
	//각 벽돌의 가로 사이즈 입력 및 필수 세팅
	$('.bricks').css('width',bws);
	$('.bricks').css('float','left');
	$('.bricks').css('position','relative');
	console.info('벽돌 틀 생성 완료');
	
	//벽돌 내에 내용물 삽입
	$(bricks).each(function(index)
	{
		var brick = bricks[index];
		$('#'+brick.id).html(brick.html);
	})
	console.info('벽돌 내에 내용 생성');
	console.info('-------------------------');
	
}
function relocation()
{
		console.info('--------벽돌 위치 보정--------');
		//배열로 만들어진 행을 루프 시킨다.
		for(var rs = 0; rs<rows.length ; rs++){
			
			//첫번째 행은 상단에 맞추어져 있으므로 무시.
			if(rs>0){
				
				//벽돌 위치 보정을 위한 정보 추출
				var correctionBrickValues = getCorrectionValues(rows[rs-1],rs);
				//추출 된 정보로 벽돌 위치 조정
				correctionBricks(rows[rs], rows[rs-1], correctionBrickValues);
				
				console.info((rs+1)+'행 보정완료');
			}
		}	
		
		console.info('모든 보정 완료');
		console.info('------------------------------');
}
function correctionBricks(current_row, before_row, cbv){
	//앞 행의(-1) 현재 top 위치에 추출한 빈공간 를 더 뺌
	$(current_row).each(function(index){
		//앞 행의(-1) 현재 top 값 추출
		var brt = $('#'+before_row[index]).cssNumber("top");
		//빈공간 값을 음수로 변환
		var corrent_val = Number('-'+cbv[index]);
		//위에서 추출한 값을 더해 적용 보정 함
		$('#'+current_row[index]).css('top',(corrent_val+brt)+'px');
	});
}
function getCorrectionValues(bricks, rs){
	//현재 행 기준으로 앞 행(-1)에서 벽돌 중 가장 긴 세로 길이를 추출
	var mhs = 0;
	var returnVal = new Array();
	console.info('첫번째 행은 제외 함');
	$(bricks).each(function(index){
		mhs = Math.max(mhs, $('#'+bricks[index]).height());
	});
	console.info((rs+1)+'행 에 적재된 벽돌 중 가장 긴 세로 값 : '+mhs);
	
	//추출한 길이로 앞 행의(-1) 벽돌들을 비교 하여 빈공간의 크기들을 저장
	$(bricks).each(function(index){
		returnVal[index] = mhs - $('#'+bricks[index]).height();
	});
	console.info((rs+1)+'행 에 적재된 벽돌의 보정 값 배열');
	console.info(returnVal);
	return returnVal;
}
function brickAnalysis()
{
	row = new Array();
	rows = new Array();

	var row_index = 0;
	var rows_index = 0;
	$(bricks).each(function(index) 
	{ 
		//각 벽돌의 아이디 값 추출
		//var id = $(this).attr('id');
		var id = $(bricks)[index].id;
		row[row_index] = id;
		row_index++;
		//행을 배열로 만듦
		if((index+1)%nl==0){
			rows[rows_index] = row;
			row = new Array();
			row_index = 0;
			rows_index++;
		}
	})
	//남은 벽 돌은 모아서 행으로 추가 시킨다
	if(row.length>0)
	{
		rows[rows.length] = row;
	}
	console.info('----추출된 행 수(내용)----');
	console.info('행 수 : '+rows.length+' 행');
	console.info('행 별 데이터(엘리먼트 아이디)');
	console.info(rows);
	console.info('-------------------------');
}
function prependBrick(html)
{
		bricks.unshift(html);
		//벽돌 재분석
		brickAnalysis();
		
		var last_row_index = rows.length-1;
		var last_row = rows[rows.length-1];
		var last_cloumn_index = last_row.length-1;
		var last_brick_index = bricks.length-1;
		
		var bricks_html = '';
		var row = rows[0];
		var cloumn = row[0];

		bricks_html = '<div id="'+cloumn+'" class="bricks"></div>';

		if(row.length==nl)
		{
		bricks_html += '<div class="newline" style="clear:both;"></div>';
		}

		//벽돌 그리기(추가 된 것만)
		$('.masonry').prepend(bricks_html);
		//각 벽돌의 가로 사이즈 입력 및 필수 세팅
		$('#'+cloumn).css('width',bws);
		$('#'+cloumn).css('float','left');
		$('#'+cloumn).css('position','relative');
		$('#'+cloumn).css('opacity','0.0');

		//var brick = bricks[last_brick_index];
		var brick = bricks[0];
		$('#'+brick.id).html(brick.html);

		

		//기존 줄 바꿈 삭제
		console.info('기존 줄 바꿈 삭제');
		$('.newline').remove();
		
		//화면에 로드된 이미지를 역으로 메모리로 올림
		row = new Array();
		rows = new Array();
	
		var row_index = 0;
		var rows_index = 0;
		$('.bricks').each(function(index) 
		{ 
			//각 벽돌의 아이디 값 추출
			var id = $(this).attr('id');
			//var id = $(bricks)[index].id;
			row[row_index] = id;
			row_index++;
			//행을 배열로 만듦
			if((index+1)%nl==0){
				rows[rows_index] = row;
				row = new Array();
				row_index = 0;
				rows_index++;
			}
		})
		//남은 벽 돌은 모아서 행으로 추가 시킨다
		if(row.length>0)
		{
			rows[rows.length] = row;
		}
		
		console.info('새 줄바꿈 적용');
		//새 줄 바꿈 적용
		$(rows).each(function(rows_index)
		{
			var row = rows[rows_index];
			//console.info(row);
			$(row).each(function(row_index)
			{
				//수직 위치 초기화
				$('#'+row[row_index]).css('top','0px');
				if((row_index+1)%nl==0)
				{
					$('<div class="newline" style="clear:both;"></div>').insertAfter('#'+row[row_index]);
				}
			})
	
		})	
		//재정렬(수직으로 빈 공간만큼 당기기)
		relocation();

		$('#'+cloumn).animate({
		opacity: 1.0,
		}, 200, function() {
			// Animation complete.
		});
	
}
function appendBrick(html)
{
	bricks[bricks.length] = html;
	//벽돌 재분석
	brickAnalysis();

	var last_row_index = rows.length-1;
	var last_row = rows[rows.length-1];
	var last_cloumn_index = last_row.length-1;
	var last_brick_index = bricks.length-1;
	
	console.info('추가된 벽돌만 생성');
	console.info('가장 마지막에 생성된 벽돌 속성 정보 : 행 위치'+last_row_index+', 컬럼 위치 : '+last_cloumn_index+', 아이디 : '+last_row[last_row.length-1]);
	console.info('가장 마지막에 생성된 벽돌 내용 정보 : '+last_brick_index);
	
	var bricks_html = '';
	
	var row = rows[last_row_index];
	var cloumn = row[last_cloumn_index];
	
	bricks_html = '<div id="'+cloumn+'" class="bricks"></div>';
	
	if(row.length==nl)
	{
		bricks_html += '<div class="newline" style="clear:both;"></div>';
	}
	
	//벽돌 그리기(추가 된 것만)
	$('.masonry').append(bricks_html);
	//각 벽돌의 가로 사이즈 입력 및 필수 세팅
	$('#'+cloumn).css('width',bws);
	$('#'+cloumn).css('float','left');
	$('#'+cloumn).css('position','relative');
	$('#'+cloumn).css('opacity','0.0');
	
	//var brick = bricks[last_brick_index];
	var brick = bricks[last_brick_index];
	$('#'+brick.id).html(brick.html);
	
	//재정렬(수직으로 빈 공간만큼 당기기)
	relocation();
	
	$('#'+cloumn).animate({
	    opacity: 1.0,
	  }, 200, function() {
	    // Animation complete.
	  });
}
function delBrick(id)
{
	//화면 삭제
	console.info('화면 삭제');
	
	$('#'+id).animate({
	    opacity: 0.0,
	  }, 200, function() {
		  	$('#'+id).remove();
	  
			//기존 줄 바꿈 삭제
			console.info('기존 줄 바꿈 삭제');
			$('.newline').remove();
			
			//화면에 로드된 이미지를 역으로 메모리로 올림
			row = new Array();
			rows = new Array();
		
			var row_index = 0;
			var rows_index = 0;
			$('.bricks').each(function(index) 
			{ 
				//각 벽돌의 아이디 값 추출
				var id = $(this).attr('id');
				//var id = $(bricks)[index].id;
				row[row_index] = id;
				row_index++;
				//행을 배열로 만듦
				if((index+1)%nl==0){
					rows[rows_index] = row;
					row = new Array();
					row_index = 0;
					rows_index++;
				}
			})
			//남은 벽 돌은 모아서 행으로 추가 시킨다
			if(row.length>0)
			{
				rows[rows.length] = row;
			}
			
			console.info('새 줄바꿈 적용');
			//새 줄 바꿈 적용
			$(rows).each(function(rows_index)
			{
				var row = rows[rows_index];
				//console.info(row);
				$(row).each(function(row_index)
				{
					//수직 위치 초기화
					$('#'+row[row_index]).css('top','0px');
					if((row_index+1)%nl==0)
					{
						$('<div class="newline" style="clear:both;"></div>').insertAfter('#'+row[row_index]);
					}
				})
		
			})	
			
			console.info('재정렬');
			//다시 재정렬(수직으로 빈 공간만큼 당기기)
			relocation();
			
			console.info('행 정보 : '+rows.length);
			console.info('행 정보 : '+rows);
			console.info('컬럼 정보 : '+row.length);
			console.info('컬럼 정보 : '+row);
			
			if(rows.length==0 && row.length==0)
			{
				console.info('디스플레이 정보 없음 리셋 수행');
				row = new Array();
				rows = new Array();
				bricks = new Array();
			}
	});
}


