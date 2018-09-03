RUN(() => {
	
	const URL_REGEX = /(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-a-z\u0080-\uffff\d{1-3}]+\.)+(?:[a-z\u0080-\uffff]+))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\u0000-\uffff~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\u0000-\uffff~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\u0000-\uffff~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\u0000-\uffff~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\u0000-\uffff~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\u0000-\uffff~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
	const MAX_FILE_SIZE = 20971520;
	
	// Firebase Ref들 가져오기
	let connectionsRef = firebase.database().ref('connections');
	let chatsRef = firebase.database().ref('chats');
	let iconsRef = firebase.storage().ref('icons');
	let uploadsRef = firebase.storage().ref('uploads');
	
	// 스킨 설정
	let chatStore = STORE('DevHellChat');
	let skin = chatStore.get('skin');
	if (skin === undefined) {
		skin = '기본';
	}
	
	let skinData = SKINS[skin];
	if (skinData === undefined) {
		skinData = SKINS.기본
	}
	
	CheckLogin((user) => {
		
		let userIconURL = 'resource/default-icon.png';
		let iconMap = {};
		
		// 로그인한 유저의 아이콘을 가져옵니다.
		LoadIcon(user.uid, (url) => {
			userIconURL = url;
			EACH(iconMap[user.uid], (icon) => {
				icon.setSrc(url);
			});
		});
		
		let preview;
		
		// 채팅 목록
		let messageInput;
		let messageList = DIV({
			style : {
				position : 'relative',
				backgroundColor : skinData.backgroundColor,
				color : skinData.color,
				paddingTop : 10,
				overflowY : 'scroll',
				onDisplayResize : (width, height) => {
					
					// 모바일
					if (width <= 1280) {
						return {
							fontSize : 14,
							height : height - 58 - 38
						};
					} else {
						return {
							fontSize : 15,
							height : height - 58 - 38
						};
					}
				}
			}
		}).appendTo(Layout.getContent());
		
		let scrollToEnd = () => {
			messageList.scrollTo({
				top : 999999
			});
		};
		
		// 시스템 메시지 추가
		let addSystemMessage = (title, message) => {
			
			let children = ['[' + title + '] '];
			if (CHECK_IS_ARRAY(message) === true) {
				EXTEND({
					origin : children,
					extend : message
				});
			} else {
				children.push(message);
			}
			
			messageList.append(DIV({
				style : {
					color : skinData.systemColor,
					fontWeight : 'bold',
					onDisplayResize : (width, height) => {
						
						// 모바일
						if (width <= 1280) {
							return {
								padding : '0 6px',
								paddingBottom : 6
							};
						} else {
							return {
								padding : '0 8px',
								paddingBottom : 8
							};
						}
					}
				},
				c : children
			}));
			
			if (messageList.getScrollTop() >= messageList.getScrollHeight() - messageList.getHeight() - 10 === true) {
				scrollToEnd();
			}
		};
		
		// 메시지 입력 폼
		let uploadInput;
		let uploadButton;
		FORM({
			style : {
				position : 'absolute',
				bottom : 0,
				width : '100%',
				borderTop : '1px solid ' + skinData.lineColor
			},
			c : [
			messageInput = UUI.FULL_INPUT({
				style : {
					backgroundColor : skinData.backgroundColor,
					padding : 8,
					fontSize : 15
				},
				inputStyle : {
					color : skinData.color,
					onDisplayResize : (width) => {
						return {
							width : Layout.getContent().getWidth() - 100
						};
					}
				},
				name : 'message',
				placeholder : '메시지 입력 ㄱㄱ',
				isOffAutocomplete : true
			}),
			
			// 설정 버튼
			A({
				style : {
					position : 'absolute',
					right : 50,
					bottom : 0,
					padding : 8,
					color : '#ccc',
					fontSize : 16
				},
				c : FontAwesome.GetIcon('cog'),
				on : {
					mouseover : (e, button) => {
						button.addStyle({
							color : '#999'
						});
					},
					mouseout : (e, button) => {
						button.addStyle({
							color : '#ccc'
						});
					},
					tap : () => {
						
						// 설정 창 띄우기
						let iconPreview;
						let description;
						Yogurt.Alert({
							msg : [
								H3({
									style : {
										fontWeight : 'bold'
									},
									c : '아이콘 설정'
								}),uploadInput = INPUT({
									style : {
										position : 'fixed',
										left : -999999,
										top : -999999
									},
									type : 'file',
									on : {
										change : () => {
											let file = uploadInput.getEl().files[0];
											
											if (file.size !== undefined && file.size <= 10240) {
												
												description.empty();
												description.append('업로드 중...');
												
												iconsRef.child(user.uid).put(file).then((snapshot) => {
													iconsRef.child(user.uid).getDownloadURL().then((url) => {
														
														iconPreview.setSrc(url);
														
														description.empty();
														description.append('10KB 이하 PNG만 가능');
													});
												});
											}
											
											else {
												alert('파일 용량이 초과하였습니다.');
											}
										}
									}
								}), A({
									c : iconPreview = IMG({
										style : {
											marginTop : 10,
											width : 40,
											height : 40,
											borderRadius : 10
										},
										src : LoadIcon.getUserIconURL(user.uid) === undefined ? 'resource/default-icon.png' : LoadIcon.getUserIconURL(user.uid)
									}),
									on : {
										tap : () => {
											uploadInput.select();
										}
									}
								}), description = P({
									c : '10KB 이하 PNG만 가능'
								})	
							]
						});
					}
				}
			}),
			
			uploadInput = INPUT({
				style : {
					position : 'fixed',
					left : -999999,
					top : -999999
				},
				type : 'file',
				on : {
					change : () => {
						let file = uploadInput.getEl().files[0];
						
						if (file.size !== undefined && file.size <= MAX_FILE_SIZE) {
							uploadFile(file);
						}
						
						else {
							alert('제한 크기를 초과한 파일입니다.');
						}
					}
				}
			}),
			
			// 업로드 버튼
			uploadButton = A({
				style : {
					position : 'absolute',
					right : 10,
					bottom : 0,
					padding : 8,
					color : '#ccc',
					fontSize : 16
				},
				c : FontAwesome.GetIcon('upload'),
				on : {
					mouseover : (e, button) => {
						button.addStyle({
							color : '#999'
						});
					},
					mouseout : (e, button) => {
						button.addStyle({
							color : '#ccc'
						});
					},
					tap : () => {
						uploadInput.select();
					}
				}
			})],
			
			on : {
				submit : (e, form) => {
					
					let message = form.getData().message;
					form.setData({});
					
					if (message !== '') {
						
						// 명령어 처리
						if (message[0] === '/') {
							
							let args = message.substring(1).split(' ');
							let command = args[0];
							args.shift();
							
							if (command === '닉네임') {
								
								let originName = user.displayName;
								
								if (args.length === 0) {
									addSystemMessage('사용법', '/닉네임 {name}');
								}
								
								else if (originName !== args[0] && /^[ㄱ-ㅎ가-힣a-zA-Z0-9]{1,6}$/.test(args[0]) === true) {
									user.updateProfile({
										displayName : args[0]
									}).then(() => {
										chatsRef.push({
											isNameChanged : true,
											originName : originName,
											newName : user.displayName
										});
										refreshConnection();
									});
								}
							}
							
							else if (command === '접속자') {
								showRecentlyUsers();
							}
							
							else if (command === '스킨') {
								
								if (args.length === 0) {
									let skinStr = '';
									EACH(SKINS, (skinData, skin) => {
										if (skinStr !== '') {
											skinStr += ', ';
										}
										skinStr += skin;
									});
									addSystemMessage('사용법', '/스킨 {skin}\n[스킨 종류] ' + skinStr);
								}
								
								else if (SKINS[args[0]] !== undefined) {
									chatStore.save({
										name : 'skin',
										value : args[0]
									});
									location.reload();
								}
							}
							
							else if (command === '이모티콘') {
								let emoticonStr = '';
								EACH(EMOTICONS, (emoticon, i) => {
									if (i > 0) {
										emoticonStr += ', ';
									}
									emoticonStr += emoticon;
								});
								addSystemMessage('사용법', '메시지 중간에 :이모티콘:과 같은 형태로 사용\n[이모티콘 종류] ' + emoticonStr);
							}
							
							else if (command === '로그아웃') {
								firebase.auth().signOut();
							}
							
							else {
								addSystemMessage('명령어', '/명령어, /닉네임, /접속자, /스킨, /이모티콘, /로그아웃');
							}
						}
						
						// 메시지 전송
						else {
							chatsRef.push({
								userId : user.uid,
								name : user.displayName,
								userIconURL : userIconURL,
								message : message.trim()
							});
						}
					}
				}
			}
		}).appendTo(Layout.getContent());
		
		messageInput.focus();
		
		// 로딩 이미지
		let loading = IMG({
			style : {
				position : 'absolute',
				left : 5,
				bottom : 0
			},
			src : 'resource/loading.svg'
		}).appendTo(messageList);
		
		// 파일 업로드 처리
		let uploadFile = (file) => {
			
			let fileId = UUID();
			
			let uploadTask = uploadsRef.child(fileId).child(file.name).put(file);
			
			uploadTask.on('state_changed', (snapshot) => {
				uploadButton.empty();
				uploadButton.append(INTEGER((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
			}, () => {
				uploadButton.empty();
				uploadButton.append(FontAwesome.GetIcon('upload'));
				uploadButton.addStyle({
					color : '#ccc'
				});
			}, () => {
				uploadButton.empty();
				uploadButton.append(FontAwesome.GetIcon('upload'));
				uploadButton.addStyle({
					color : '#ccc'
				});
				
				uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
					chatsRef.push({
						userId : user.uid,
						name : user.displayName,
						userIconURL : userIconURL,
						fileId : fileId,
						fileName : file.name,
						downloadURL : downloadURL,
						isImage : file.type.indexOf('image') !== -1
					});
				});
			});
		};
		
		let chatDataSet = [];
		
		// 새 메시지가 추가되면
		chatsRef.on('child_added', (snapshot) => {
			loading.remove();
			
			let isToScrollBottom = messageList.getScrollTop() >= messageList.getScrollHeight() - messageList.getHeight() - 10;
			
			let chatData = snapshot.val();
			chatData.key = snapshot.key;
			
			chatDataSet.push(chatData);
			
			// 닉변 알림
			if (chatData.isNameChanged === true) {
				addSystemMessage('닉네임 변경', [chatData.originName, FontAwesome.GetIcon({
					style : {
						margin : '0px 5px'
					},
					key : 'caret-right'
				}), chatData.newName]);
			}
			
			// 새 메시지
			else {
				
				let icon;
				messageList.append(DIV({
					style : {
						onDisplayResize : (width, height) => {
							// 모바일
							if (width <= 1280) {
								return {
									padding : '0 6px',
									paddingBottom : 6
								};
							} else {
								return {
									padding : '0 8px',
									paddingBottom : 8
								};
							}
						}
					},
					c : [icon = IMG({
						style : {
							marginRight : 5,
							backgroundColor : '#fff',
							onDisplayResize : (width, height) => {
								// 모바일
								if (width <= 1280) {
									return {
										marginBottom : -4,
										width : 18,
										height : 18,
										borderRadius : 4
									};
								} else {
									return {
										marginBottom : -5,
										width : 20,
										height : 20,
										borderRadius : 5
									};
								}
							}
						},
						src : LoadIcon.getUserIconURL(chatData.userId) === undefined ? chatData.userIconURL : LoadIcon.getUserIconURL(chatData.userId)
					}), SPAN({
						style : {
							fontWeight : 'bold',
							marginRight : 6,
							color : skinData.nameColor
						},
						c : chatData.name
					}), SPAN({
						style : {
							fontSize : 0
						},
						c : ' : '
					}), chatData.downloadURL !== undefined ? A({
						style : {
							fontWeight : 'bold',
							textDecoration : 'underline'
						},
						c : chatData.fileName !== undefined ? chatData.fileName : chatData.downloadURL,
						target : '_blank',
						href : chatData.downloadURL,
						on : {
							mouseover : (e) => {
								
								// 모바일 제외
								if (
								INFO.getOSName() !== 'Android' && INFO.getOSName() !== 'iOS' &&
								preview === undefined && chatData.isImage === true) {
									
									preview = UUI.V_CENTER({
										style : {
											position : 'fixed',
											left : e.getLeft() + 10,
											top : e.getTop() - 42 - 8,
											width : 90,
											height : 60,
											backgroundColor : '#fff',
											backgroundImage : chatData.downloadURL,
											backgroundSize : 'cover',
											backgroundPosition : 'center center',
											border : '1px solid #333',
											textAlign : 'center'
										},
										c : IMG({
											style : {
												height : 40
											},
											src : 'resource/loading.svg'
										})
									}).appendTo(BODY);
									
									IMG({
										src : chatData.downloadURL,
										on : {
											load : () => {
												if (preview !== undefined) {
													preview.empty();
												}
											}
										}
									});
								}
							},
							mouseout : () => {
								if (preview !== undefined) {
									preview.remove();
									preview = undefined;
								}
							}
						}
					}) : RUN(() => {
						
						let message = chatData.message;
						
						// 호출 기능
						if (chatData.isCalled !== true && chatData.name !== user.displayName && (message + ' ').indexOf('@' + user.displayName + ' ') !== -1) {
							
							// 아이폰은 지원 안함
							if (global.Notification === undefined || Notification.permission !== 'granted') {
								DELAY(() => {
									chatsRef.push({
										userId : user.uid,
										name : user.displayName,
										userIconURL : userIconURL,
										message : '(호출 기능이 차단된 유저입니다)'
									});
								});
							}
							
							else if (document.hasFocus() !== true) {
								new Notification(chatData.name, {
									body : message,
								}).onclick = () => {
									focus();
								};
							}
							
							let updates = {};
							chatData.isCalled = true;
							updates[snapshot.key] = chatData;
							chatsRef.update(updates);
						}
						
						let children = [];
						
						EACH(message.split(' '), (message, i) => {
							
							if (i > 0) {
								children.push(' ');
							}
							
							// 이모티콘을 찾아 교체합니다.
							let replaceEmoticon = (message) => {
								
								let match = message.match(/:[^:]*:/);
								if (match === TO_DELETE) {
									children.push(message);
								}
								
								else {
									
									let emoticonStr = match[0];
									let emoticon = emoticonStr.substring(1, emoticonStr.length - 1).toLowerCase();
									
									if (CHECK_IS_IN({
										array : EMOTICONS,
										value : emoticon
									}) === true) {
										
										let index = message.indexOf(emoticonStr);
										
										children.push(message.substring(0, index));
										
										children.push(IMG({
											style : {
												marginBottom : -4
											},
											src : 'resource/emoticon/' + emoticon + '.png',
											on : {
												load : () => {
													// 로딩이 다 되면 스크롤 끝으로
													if (isToScrollBottom === true || chatData.userId === user.uid) {
														scrollToEnd();
													}
												}
											}
										}));
										
										message = replaceEmoticon(message.substring(index + emoticonStr.length));
									}
									
									else {
										children.push(message);
									}
								}
								
								return message;
							};
							
							// 링크를 찾아 교체합니다.
							let replaceLink = () => {
								
								let match = message.match(URL_REGEX);
								if (match === TO_DELETE) {
									message = replaceEmoticon(message);
								}
								
								else {
									
									let url = match[0];
									if (url.indexOf(' ') !== -1) {
										url = url.substring(0, url.indexOf(' '));
									}
									
									let index = message.indexOf(url);
									
									message = replaceEmoticon(message.substring(0, index));
									message = message.substring(index + url.length);
									
									children.push(A({
										style : {
											textDecoration : 'underline'
										},
										target : '_blank',
										href : url,
										c : url
									}));
									
									replaceLink();
								}
							};
							
							replaceLink();
						});
						
						return SPAN({
							c : children
						});
					})]
				}));
				
				if (iconMap[chatData.userId] === undefined) {
					iconMap[chatData.userId] = [];
				}
				iconMap[chatData.userId].push(icon);
				
				LoadIcon(chatData.userId, (url) => {
					EACH(iconMap[chatData.userId], (icon) => {
						icon.setSrc(url);
					});
				});
			}
			
			// 마지막 메시지를 보고있거나 자기가 쓴 글이라면 스크롤 맨 아래로
			if (isToScrollBottom === true || chatData.userId === user.uid) {
				scrollToEnd();
			}
			
			// 오래된 메시지 삭제
			if (chatDataSet.length > 100) {
				chatsRef.child(chatDataSet[0].key).remove();
				chatDataSet.shift();
			}
		});
		
		// 접속자 목록을 위해 1분에 한번씩 커넥션을 유지합니다.
		let refreshConnection = () => {
			connectionsRef.child(user.uid).set({
				userId : user.uid,
				name : user.displayName,
				userIconURL : userIconURL,
				time : firebase.database.ServerValue.TIMESTAMP
			});
		};
		INTERVAL(60, RAR(refreshConnection));
		
		let recentlyUsers = [];
		let showRecentlyUsers = () => {
			
			let names = '';
			EACH(recentlyUsers, (recentlyUser, i) => {
				if (i > 0) {
					names += ', ';
				}
				names += recentlyUser.name;
			});
			
			addSystemMessage('접속자 ' + recentlyUsers.length + '명', names);
		};
		
		let isFirstShowingRecentlyUsers = true;
		
		// 최근 유저를 가져옵니다.
		connectionsRef.on('value', (snapshot) => {
			
			let connections = [];
			snapshot.forEach((childSnapshot) => {
				connections.push(childSnapshot.val());
			});
			
			let lastTime = 0;
			connections.forEach((connection) => {
				if (connection.time > lastTime) {
					lastTime = connection.time;
				}
			});
			
			let names = '';
			let originRecentlyUsers = recentlyUsers;
			
			recentlyUsers = [];
			connections.forEach((connection) => {
				
				// 마지막 접속자와 비교하여 2분 미만 내에 커넥션을 유지한 사용자만
				if (lastTime - connection.time < 2 * 60 * 1000) {
					recentlyUsers.push({
						userId : connection.userId,
						userIconURL : connection.userIconURL,
						name : connection.name
					});
					
					// 새로 접속한 유저면, 알려줍니다.
					let isNewConnectionUser = true;
					EACH(originRecentlyUsers, (originRecentlyUser) => {
						if (originRecentlyUser.userId === connection.userId) {
							isNewConnectionUser = false;
						}
					});
					if (isFirstShowingRecentlyUsers !== true && isNewConnectionUser === true) {
						addSystemMessage(connection.name + '가 접속함. 인사 ㄱㄱ');
					}
				}
			});
			
			Layout.setRecentlyUsers(recentlyUsers);
			
			if (isFirstShowingRecentlyUsers === true) {
				isFirstShowingRecentlyUsers = false;
				showRecentlyUsers();
			}
		});
	});
});
