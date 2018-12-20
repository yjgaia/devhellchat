global.ChatController = OBJECT({
	
	init : (inner, self) => {
		
		const URL_REGEX = /(http|https|ftp|telnet|news|mms):\/[^\"\'\s()]+/i;
		const MAX_UPLOAD_FILE_SIZE = 26214400;
		
		// Firebase Ref들 가져오기
		let chatsRef = firebase.database().ref('chats');
		let iconsRef = firebase.storage().ref('icons');
		let chatUploadsRef = chatUploadApp.storage().ref('uploads');
		
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
		
		let isHiding = true;
		let messageList;
		let messageForm;
		
		let scrollToEnd = () => {
			if (messageList !== undefined) {
				messageList.scrollTo({
					top : 999999
				});
			}
		};
		
		let hide = self.hide = () => {
			isHiding = true;
			
			if (messageList !== undefined) {
				messageList.hide();
			}
			if (messageForm !== undefined) {
				messageForm.hide();
			}
		};
		
		let show = self.show = () => {
			isHiding = false;
			
			if (messageList !== undefined) {
				messageList.show();
			}
			if (messageForm !== undefined) {
				messageForm.show();
			}
			
			scrollToEnd();
		};
		
		let isInited = false;
		let checkIsInited = self.checkIsInited = () => {
			return isInited;
		};
		
		// 컨트롤러를 초기화합니다.
		let init = self.init = (user) => {
			isInited = true;
			
			// 호출 허락 (아이폰은 지원안함)
			if (global.Notification !== undefined && Notification.permission !== 'granted') {
				Notification.requestPermission();
			}
			
			let iconMap = {};
			
			// 로그인한 유저의 아이콘을 가져옵니다.
			LoadIcon(user.uid, (url) => {
				EACH(iconMap[user.uid], (icon) => {
					icon.setSrc(url);
				});
			});
			
			let preview;
			
			// 채팅 목록
			messageList = DIV({
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
			
			// 시스템 메시지 추가
			let addSystemMessage = self.addSystemMessage = (title, message, scroll) => {
				
				let isToScrollBottom = messageList.getScrollTop() >= messageList.getScrollHeight() - messageList.getHeight() - 10;
				
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
				
				if (scroll !== false || isToScrollBottom === true) {
					scrollToEnd();
				}
			};
			
			// 최근 접속 유저 출력
			let showRecentlyUsers = self.showRecentlyUsers = () => {
				
				let names = '';
				EACH(ConnectionController.getRecentlyUsers(), (recentlyUser, i) => {
					if (i > 0) {
						names += ', ';
					}
					names += recentlyUser.name;
				});
				
				addSystemMessage('접속자 ' + ConnectionController.getRecentlyUsers().length + '명', names);
			};
			
			// 공지사항 출력
			let showNotice = self.showNotice = () => {
				addSystemMessage('공지', '한국 도메인 1년 무료 이벤트 하길래 http://헬쳇.한국 만들었음. 1년간 접속가능여');
			};
			
			// 화면 크기가 바뀌면 스크롤 맨 아래로
			EVENT('resize', () => {
				DELAY(() => {
					scrollToEnd();
				});
			});
			
			let sendMessage = self.sendMessage = (message) => {
				
				chatsRef.push({
					userId : user.uid,
					name : user.displayName,
					userIconURL : ConnectionController.getUserIconURL(),
					message : message
				});
				
				UserController.increaseEXP(10);
			};
			
			// 메시지 입력 폼
			let messageInput;
			let uploadInput;
			let uploadButton;
			let semiMenu;
			messageForm = FORM({
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
					isOffAutocomplete : true,
					on : {
						keydown : (e) => {
							if (e.getKey() === 'Escape') {
								if (semiMenu !== undefined) {
									semiMenu.remove();
								}
							}
						},
						doubletap : () => {
							
							if (semiMenu !== undefined) {
								semiMenu.remove();
							}
							
							semiMenu = DIV({
								style : {
									position : 'absolute',
									left : 5,
									bottom : 43
								},
								c : [A({
									style : {
										flt : 'left',
										padding : '4px 8px',
										border : '1px solid #999',
										backgroundColor : '#eee',
										color : '#000',
										borderRadius : 3
									},
									c : '접속자 보기',
									on : {
										touchstart : () => {
											showRecentlyUsers();
											DELAY(() => {
												messageInput.focus();
											});
										}
									}
								}), A({
									style : {
										marginLeft : 5,
										flt : 'left',
										padding : '4px 8px',
										border : '1px solid #999',
										backgroundColor : '#eee',
										color : '#000',
										borderRadius : 3
									},
									c : '내 정보 보기',
									on : {
										touchstart : () => {
											GO('user/' + user.uid);
										}
									}
								}), CLEAR_BOTH()]
							}).appendTo(Layout.getContent());
							
							EVENT_ONCE('touchstart', () => {
								if (semiMenu !== undefined) {
									semiMenu.remove();
									semiMenu = undefined;
								}
							});
						}
					}
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
					c : FontAwesome.GetIcon('grin-wink'),
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
									}), uploadInput = INPUT({
										style : {
											position : 'fixed',
											left : -999999,
											top : -999999
										},
										type : 'file',
										on : {
											change : () => {
												let file = uploadInput.getEl().files[0];
												
												if (file !== undefined) {
													
													if (file.size !== undefined && file.size <= 10240) {
														
														description.empty();
														description.append('업로드 중...');
														
														iconsRef.child(user.uid).put(file, {
															cacheControl : 'public,max-age=31536000'
														}).then((snapshot) => {
															iconsRef.child(user.uid).getDownloadURL().then((url) => {
																
																iconPreview.setSrc(url);
																
																description.empty();
																description.append('10KB 이하 PNG만 가능');
															});
														});
													}
													
													else {
														alert('용량이 너무큼! 최대 용량 10KB 임');
														uploadInput.setValue('');
													}
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
											src : LoadIcon.getUserIconURL(user.uid) === undefined ? ConnectionController.getUserIconURL() : LoadIcon.getUserIconURL(user.uid)
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
							
							if (file !== undefined) {
								
								if (file.size !== undefined && file.size <= MAX_UPLOAD_FILE_SIZE) {
									uploadFile(file);
									uploadInput.setValue('');
								}
								
								else {
									alert('용량이 너무큼! 최대 용량 ' + INTEGER(MAX_UPLOAD_FILE_SIZE / 1024 / 1024) + 'MB 임');
									uploadInput.setValue('');
								}
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
									EACH(EMOTICONS, (notUsing, emoticon) => {
										if (emoticonStr !== '') {
											emoticonStr += ', ';
										}
										emoticonStr += emoticon;
									});
									addSystemMessage('사용법', '메시지 중간에 :이모티콘:과 같은 형태로 사용, 다른 사람이 쓴 이모티콘을 더블클릭하면 복사 가능\n[이모티콘 종류] ' + emoticonStr);
								}
								
								else if (command === '처치') {
									
									if (args.length === 0) {
										addSystemMessage('사용법', '/처치 [이름]');
									}
									
									else {
										chatsRef.push({
											userId : user.uid,
											name : user.displayName,
											userIconURL : ConnectionController.getUserIconURL(),
											targetName : args[0].substring(0, 20),
											isEliminated : true
										});
									}
								}
								
								else if (command === '레벨') {
									UserController.getUserData(user.uid, (userData) => {
										addSystemMessage(user.displayName + '님 레벨', 'Lv. ' + userData.level);
									});
								}
								
								else if (command === '로그아웃') {
									firebase.auth().signOut();
								}
								
								else if (command === '참피온') {
									chatStore.remove('champioff');
									addSystemMessage('참피온', '이제 참피 관련 단어 보임');
								}
								
								else if (command === '참피오프') {
									chatStore.save({
										name : 'champioff',
										value : true
									});
									addSystemMessage('참피오프', '이제 참피 관련 단어 숨겨짐');
								}
								
								else {
									addSystemMessage('명령어', '/명령어, /닉네임, /접속자, /스킨, /이모티콘, /처치, /레벨, /로그아웃, /참피온, /참피오프');
								}
							}
							
							// 메시지 전송
							else {
								sendMessage(message.trim());
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
				src : '/resource/loading.svg'
			}).appendTo(messageList);
			
			// 파일 업로드 처리
			let uploadFile = (file) => {
				
				let fileId = UUID();
				
				let uploadTask = chatUploadsRef.child(fileId).child(file.name).put(file, {
					cacheControl : 'public,max-age=31536000'
				});
				
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
							userIconURL : ConnectionController.getUserIconURL(),
							uploadServer : 'chatUploadApp',
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
				
				// 새 유게짱
				if (chatData.isUGay === true) {
					addSystemMessage('새 유게짱!', A({
						style : {
							textDecoration : 'underline'
						},
						c : chatData.title + ', by ' + chatData.name,
						on : {
							tap : () => {
								GO('u-gay');
							}
						}
					}));
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
						}), A({
							style : {
								fontWeight : 'bold',
								marginRight : 6,
								color : skinData.nameColor
							},
							c : chatData.name,
							on : {
								tap : (e) => {
									e.stop();
									
									ContextMenu({
										style : {
											left : e.getLeft(),
											top : e.getTop()
										},
										c : [LI({
											style : ContextMenu.getItemStyle(),
											c : UUI.BUTTON_H({
												style : {
													margin : 'auto'
												},
												icon : FontAwesome.GetIcon({
													style : {
														marginTop : 1
													},
													key : 'id-card'
												}),
												spacing : 8,
												title : MSG({
													ko : '정보보기'
												})
											}),
											on : {
												tap : () => {
													GO('user/' + chatData.userId);
												}
											}
										}), LI({
											style : ContextMenu.getItemStyle(),
											c : UUI.BUTTON_H({
												style : {
													margin : 'auto'
												},
												icon : FontAwesome.GetIcon({
													style : {
														marginTop : 1
													},
													key : 'phone-square'
												}),
												spacing : 8,
												title : MSG({
													ko : '호출하기'
												})
											}),
											on : {
												tap : () => {
													ChatController.sendMessage('@' + chatData.name);
												}
											}
										})]
									});
								}
							}
						}), SPAN({
							style : {
								fontSize : 0
							},
							c : ' : '
						}),
						
						// 업로드인 경우
						chatData.downloadURL !== undefined ? A({
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
												height : 90,
												backgroundColor : '#fff',
												backgroundImage : chatData.downloadURL,
												backgroundSize : 'cover',
												backgroundPosition : 'center center',
												border : '1px solid #333',
												textAlign : 'center'
											},
											c : IMG({
												style : {
													marginTop : 10,
													height : 40
												},
												src : '/resource/loading.svg'
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
						})
						
						:
						
						(
							chatData.isEliminated === true ?
							
							// 처치인 경우
							SPAN({
								style : {
									fontFamily : 'Koverwatch',
									fontStyle : 'italic',
									textShadow : TextBorderShadow('#333'),
									fontSize : 20,
									letterSpacing : 2
								},
								c : [SPAN({
									style : {
										color : '#ff1a1a'
									},
									c : chatData.targetName
								}), SPAN({
									style : {
										color : '#fff'
									},
									c : ' 처치'
								}), SPAN({
									style : {
										color : '#ff1a1a'
									},
									c : ' (+100) '
								})]
							})
							
							:
							
							// 일반 메시지인 경우
							RUN(() => {
								
								let message = chatData.message;
								
								// 참피 필터링
								if (chatStore.get('champioff') === true) {
									message = UTIL.champiFilter(message);
								}
								
								let originMessage = message;
								
								if (message.length > 200) {
									message = message.substring(0, 200);
								}
								
								// 호출 기능
								if (chatData.isCalled !== true && chatData.name !== user.displayName && (message + ' ').indexOf('@' + user.displayName + ' ') !== -1) {
									
									// 아이폰은 지원 안함
									if (global.Notification === undefined || Notification.permission !== 'granted') {
										DELAY(() => {
											chatsRef.push({
												userId : user.uid,
												name : user.displayName,
												userIconURL : ConnectionController.getUserIconURL(),
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
											
											if (EMOTICONS[emoticon] !== undefined) {
												
												let index = message.indexOf(emoticonStr);
												
												children.push(message.substring(0, index));
												
												children.push(IMG({
													style : {
														marginBottom : -4
													},
													src : '/resource/emoticon/' + emoticon + (EMOTICONS[emoticon].isGIF === true ? '.gif' : '.png') + (EMOTICONS[emoticon].isNoCaching === true ? '?' + Date.now() : ''),
													on : {
														load : () => {
															// 로딩이 다 되면 스크롤 끝으로
															if (isToScrollBottom === true || chatData.userId === user.uid) {
																scrollToEnd();
															}
														},
														doubletap : (e) => {
															
															messageInput.setValue(messageInput.getValue() + ':' + emoticon + ':');
															messageInput.focus();
															
															e.stopDefault();
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
								
								// 너무 긴 메시지면 더보기 추가
								if (message !== originMessage) {
									children.push(' ...');
									children.push(A({
										style : {
											textDecoration : 'underline'
										},
										c : '[더보기]',
										on : {
											tap : () => {
												Yogurt.Alert({
													style : {
														onDisplayResize : (width) => {
															if (width < 800) {
																return {
																	width : 300
																};
															} else if (width < 1200) {
																return {
																	width : 600
																};
															} else {
																return {
																	width : 1000
																};
															}
														}
													},
													contentStyle : {
														padding : 0
													},
													msg : DIV({
														style : {
															height : 300,
															overflowY : 'scroll',
															fontSize : 14,
															padding : 10,
															lineHeight : '1.4em',
															textAlign : 'left'
														},
														c : originMessage
													})
												});
											}
										}
									}));
								}
								
								return SPAN({
									c : children
								});
							})
						)]
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
					
					if (chatDataSet[0].fileId !== undefined) {
						chatUploadsRef.child(chatDataSet[0].fileId).delete();
					}
					
					chatsRef.child(chatDataSet[0].key).remove();
					chatDataSet.shift();
				}
			});
			
			// 붙여넣기로 업로드
			EVENT('paste', (e) => {
				EACH(e.getClipboardItems(), (item) => {
					
					if (item.type.indexOf('image') !== -1) {
						
						let file = item.getAsFile();
						
						if (file.size !== undefined && file.size <= MAX_UPLOAD_FILE_SIZE) {
							if (confirm('복사한 이미지 업로드 ㄱㄱ?') === true) {
								uploadFile(file);
							}
						}
						
						else {
							alert('용량이 너무큼! 최대 용량 ' + INTEGER(MAX_UPLOAD_FILE_SIZE / 1024 / 1024) + 'MB 임');
						}
						
						e.stopDefault();
						
						return false;
					}
				});
			});
			
			// 모바일 제외
			if (INFO.getOSName() !== 'Android' && INFO.getOSName() !== 'iOS') {
				
				// 기본 드래그 앤 드롭 막기
				EVENT('dragover', (e) => {
					e.stop();
				});
				
				// 미리보기 이동
				EVENT('mousemove', (e) => {
					if (preview !== undefined) {
						preview.addStyle({
							left : e.getLeft() + 10,
							top : e.getTop() - preview.getHeight() - 8
						});
					}
				});
				
				// 드래그 앤 드롭으로 업로드
				EVENT('drop', (e) => {
					EACH(e.getFiles(), (file) => {
						
						if (file.size !== undefined && file.size <= MAX_UPLOAD_FILE_SIZE) {
							uploadFile(file);
						}
						
						else {
							alert('용량이 너무큼! 최대 용량 ' + INTEGER(MAX_UPLOAD_FILE_SIZE / 1024 / 1024) + 'MB 임');
							return false;
						}
					});
					e.stopDefault();
				});
			}
			
			if (isHiding === true) {
				hide();
			}
		};
	}
});