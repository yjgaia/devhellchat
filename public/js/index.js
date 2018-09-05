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
				
				let wrapper = DIV({
					c : [
					
					// 뒤로가기
					UUI.BUTTON_H({
						style : {
							position : 'absolute',
							left : 10,
							top : 10
						},
						icon : FontAwesome.GetIcon({
							style : {
								fontSize : 20
							},
							key : 'arrow-left'
						}),
						spacing : 10,
						title : SPAN({
							style : {
								fontSize : 14
							},
							c : '채팅으로'
						}),
						on : {
							tap : () => {
								GO('');
							}
						}
					}),
					
					AboutPanel({
						style : {
							padding : '60px 40px'
						}
					})]
				}).appendTo(Layout.getContent());
				
				inner.on('close', () => {
					wrapper.remove();
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
