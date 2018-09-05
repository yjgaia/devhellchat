RUN(() => {
	
	MATCH_VIEW({
		uri : '',
		target : CLASS({
			preset : () => {
				return VIEW;
			},
			init : (inner) => {
				ChatController.show();
				inner.on('close', () => {
					ChatController.hide();
				});
			}
		})
	});
	
	MATCH_VIEW({
		uri : 'about',
		target : CLASS({
			preset : () => {
				return VIEW;
			},
			init : (inner) => {
				let aboutPanel = AboutPanel().appendTo(Layout.getContent());
				inner.on('close', () => {
					aboutPanel.remove();
				});
			}
		})
	});
	
	// 로그인 처리
	CheckLogin((user) => {
		
		// 메뉴 열기
		Layout.showMenu();
		
		// 컨트롤러들 초기화
		ChatController.init(user);
		ConnectionController.init(user);
	});
});
