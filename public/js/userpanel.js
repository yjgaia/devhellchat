global.UserPanel = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		let wrapper;
		inner.on('paramsChange', (params) => {
			let userId = params.userId;
			
			if (wrapper !== undefined) {
				wrapper.remove();
			}
			
			wrapper = DIV({
				style : {
					fontSize : 16,
					height : '100%',
					overflowY : 'scroll'
				},
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
				})]
			}).appendTo(Layout.getContent());
			
			// 로딩 이미지
			let loading = IMG({
				style : {
					position : 'absolute',
					left : 60,
					top : 60
				},
				src : '/resource/loading.svg'
			}).appendTo(wrapper);
			
			// 유저 정보 불러오기
			UserController.getUserData(userId, (userData) => {
				loading.remove();
				
				if (userData === undefined) {
					wrapper.append(DIV({
						style : {
							padding : '60px 40px'
						},
						c : '유저 정보가 없는데? 뭔 문제가 있나봄'
					}));
				}
				
				else {
					
					let iconWrapper;
					let introducePanel;
					wrapper.append(DIV({
						style : {
							padding : '60px 40px'
						},
						c : [DIV({
							style : {
								flt : 'left',
								width : 40,
								height : 40
							},
							c : LoadIcon.getUserIconURL(userId) === undefined ? '' : IMG({
								style : {
									width : 40,
									height : 40,
									borderRadius : 10
								},
								src : LoadIcon.getUserIconURL(userId)
							})
						}), H1({
							style : {
								marginLeft : 15,
								flt : 'left',
								fontSize : 25,
								fontWeight : 'bold'
							},
							c : userData.name
						}), CLEAR_BOTH(),
						
						DIV({
							style : {
								marginTop : 20
							},
							c : ['Lv. ' + userData.level, SPAN({
								style : {
									marginLeft : 8,
									color : '#999',
									fontSize : 12
								},
								c : '(' + userData.exp + ' EXP)'
							})]
						}),
						
						DIV({
							style : {
								marginTop : 20
							},
							c : introducePanel = P({
								c : userData.introduce === undefined ? '자기 소개가 없음' : userData.introduce
							})
						})]
					}));
					
					LoadIcon(userId, (url) => {
						iconWrapper.empty();
						iconWrapper.append(IMG({
							style : {
								width : 40,
								height : 40,
								borderRadius : 10
							},
							src : url
						}));
					});
					
					if (userId === UserController.getSignedUserId()) {
						introducePanel.after(DIV({
							style : {
								marginTop : 10
							},
							c : A({
								style : {
									fontWeight : 'bold',
									textDecoration : 'underline'
								},
								c : '자기 소개 수정',
								on : {
									tap : () => {
										
										Yogurt.Prompt({
											msg : '자기 소개 입력 ㄱㄱ',
											value : userData.introduce
										}, (introduce) => {
											UserController.updateIntroduce(introduce);
											introducePanel.empty();
											introducePanel.append(introduce);
										});
									}
								}
							})
						}));
					}
				}
			});
		});
		
		inner.on('close', () => {
			if (wrapper !== undefined) {
				wrapper.remove();
			}
		});
	}
});