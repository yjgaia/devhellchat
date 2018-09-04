global.UserPanel = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, user) => {
		
		ChatController.hide();
		self.appendTo(Layout.getContent());
		
		// 뒤로가기
		self.append(UUI.BUTTON_H({
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
				tap : self.remove
			}
		}));
		
		// 유저 정보
		self.append(DIV({
			style : {
				padding : '60px 40px'
			},
			c : [icon = IMG({
				style : {
					flt : 'left',
					width : 40,
					height : 40,
					borderRadius : 10
				},
				src : LoadIcon.getUserIconURL(user.userId) === undefined ? user.userIconURL : LoadIcon.getUserIconURL(user.userId)
			}), H1({
				style : {
					marginLeft : 15,
					flt : 'left',
					fontSize : 25,
					fontWeight : 'bold'
				},
				c : user.name
			}), CLEAR_BOTH()]
		}));
		
		LoadIcon(user.userId, (url) => {
			icon.setSrc(url);
		});
		
		self.on('remove', () => {
			ChatController.show();
		});
	}
});