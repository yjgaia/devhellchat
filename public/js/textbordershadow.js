/*
 * textShadow 스타일을 이용해 글자의 테두리를 만들어주는 메소드
 */
global.TextBorderShadow = METHOD({

	run : (color) => {
		
		return '1px 1px 0 ' + color + ',' +
			'-1px 1px 0 ' + color + ',' +
			'1px -1px 0 ' + color + ',' +
			'-1px -1px 0 ' + color + ',' +
			'0px 1px 0 ' + color + ',' +
			'0px -1px 0 ' + color + ',' +
			'-1px 0px 0 ' + color + ',' +
			'1px 0px 0 ' + color;
	}
});
