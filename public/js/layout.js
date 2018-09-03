global.Layout = OBJECT({
	
	init : (inner, self) => {
		
		let content;
		let recentlyUserList;
		let menuLayout = Yogurt.MenuLayout({
			toolbar : Yogurt.Toolbar({
	
				contentStyle : {
					onDisplayResize : (width, height) => {
	
						if (width > Yogurt.Theme.menuLayoutHideMenuWinWidth) {
							return {
								left : 0,
								//left : Yogurt.Theme.menuLayoutMenuWidth,
								width : BODY.getWidth() - Yogurt.Theme.menuLayoutMenuWidth// * 2
							};
						} else {
							return {
								left : 0,
								width : '100%'
							};
						}
					}
				},
				
				/*left : Yogurt.ToolbarButton({
					style : {
						onDisplayResize : (width, height) => {
	
							if (width > Yogurt.Theme.menuLayoutHideMenuWinWidth) {
								return {
									display : 'none'
								};
							} else {
								return {
									display : 'block'
								};
							}
						}
					},
					icon : FontAwesome.GetIcon('bars'),
					on : {
						tap : (e) => {
							menuLayout.toggleLeftMenu();
						}
					}
				}),*/
	
				right : Yogurt.ToolbarButton({
					style : {
						onDisplayResize : (width, height) => {
	
							if (width > Yogurt.Theme.menuLayoutHideMenuWinWidth) {
								return {
									display : 'none'
								};
							} else {
								return {
									display : 'block'
								};
							}
						}
					},
					icon : FontAwesome.GetIcon('bars'),
					on : {
						tap : (e) => {
							menuLayout.toggleRightMenu();
						}
					}
				}),
				
				title : SPAN({
					c : 'devhellchat',
					on : {
						mouseover : (e, span) => {
							span.empty();
							span.append('개발자지옥챗');
						},
						mouseout : (e, span) => {
							span.empty();
							span.append('devhellchat');
						}
					}
				})
			}),
	
			/*leftMenu : DIV({
				c : [UUI.BUTTON_H({
					style : {
						width : '100%',
						borderBottom : '1px solid #666',
						fontSize : 15
					},
					contentStyle : {
						padding : 15
					},
					icon : FontAwesome.GetIcon('chevron-left'),
					spacing : 10,
					title : 'Go Home',
					on : {
						tap : () => {
							YogurtShowcase.GO('');
						}
					}
				})]
			}),*/
	
			rightMenu : recentlyUserList = DIV({
				c : DIV({
					style : {
						padding : 10
					},
					c : '접속자 로딩중...'
				})
			}),
	
			c : content = DIV({
				style : {
					position : 'relative',
					backgroundColor : '#fff',
					color : '#000',
					onDisplayResize : (width, height) => {
						return {
							height : height - 48
						};
					}
				}
			})
		}).appendTo(BODY);
		
		let getContent = self.getContent = () => {
			return content;
		};
		
		let setRecentlyUsers = self.setRecentlyUsers = (users) => {
			recentlyUserList.empty();
			
			recentlyUserList.append(DIV({
				style : {
					borderBottom : '1px solid #666',
					padding : 10
				},
				c : '접속자 ' + users.length + '명'
			}));
			
			EACH(users, (user) => {
				
				let icon;
				recentlyUserList.append(DIV({
					style : {
						borderBottom : '1px solid #666',
						padding : 10
					},
					c : [icon = IMG({
						style : {
							marginRight : 8,
							backgroundColor : '#fff',
							marginBottom : -5,
							width : 20,
							height : 20,
							borderRadius : 5
						},
						src : LoadIcon.getUserIconURL(user.userId) === undefined ? 'resource/default-icon.png' : LoadIcon.getUserIconURL(user.userId)
					}), user.name]
				}));
				
				LoadIcon(user.userId, (url) => {
					icon.setSrc(url);
				});
			});
		};
	}
});