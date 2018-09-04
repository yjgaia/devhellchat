RUN(() => {
	
	// 로그인 처리
	CheckLogin((user) => {
		
		// 메뉴 열기
		Layout.showMenu();
		
		// 컨트롤러들 초기화
		ChatController.init(user);
		ConnectionController.init(user);
	});
});
