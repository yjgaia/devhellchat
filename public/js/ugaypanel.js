global.UGayPanel = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner, self) => {
		
		const MAX_UPLOAD_FILE_SIZE = 26214400;
		
		// Firebase Ref들 가져오기
		let chatsRef = firebase.database().ref('chats');
		let ugayRef = firebase.database().ref('ugay');
		let ugayUploadsRef = firebase.storage().ref('uploads');
		
		let nowUploadFileServers = [];
		let nowUploadFileIds = [];
		let nowUploadFileURLs = [];
		
		// 파일 업로드 처리
		let uploadFile = (file) => {
			
			let fileId = UUID();
			
			let uploadTask = ugayUploadsRef.child(fileId).child(file.name).put(file, {
				cacheControl : 'public,max-age=31536000'
			});
			
			uploadTask.on('state_changed', (snapshot) => {
				uploadProgress.empty();
				uploadProgress.append('업로드 중...' + INTEGER((snapshot.bytesTransferred / snapshot.totalBytes) * 100) + '%');
			}, () => {
				uploadProgress.empty();
			}, () => {
				uploadProgress.empty();
				
				uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
					
					nowUploadFileServers.push('ugayUploadApp');
					nowUploadFileIds.push(fileId);
					nowUploadFileURLs.push(downloadURL);
					
					uploadPreview.append(IMG({
						style : {
							display : 'block',
							maxHeight : 100
						},
						src : downloadURL
					}));
				});
			});
		};
		
		let uploadPreview;
		let uploadInput;
		let uploadProgress;
		let list;
		let wrapper = DIV({
			style : {
				fontSize : 16
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
						fontSize : 20,
						width : 18
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
			
			DIV({
				style : {
					onDisplayResize : (width, height) => {
						if (width < 800) {
							return {
								padding : '0 20px'
							};
						} else {
							return {
								padding : '0 40px'
							};
						}
					}
				},
				c : [
				H1({
					style : {
						marginTop : 60,
						textAlign : 'center'
					},
					c : IMG({
						src : '/resource/ugay.gif'
					})
				}),
				
				// 입력폼
				FORM({
					style : {
						marginTop : 20
					},
					c : [Yogurt.Input({
						name : 'title',
						placeholder : '제목'
					}), uploadPreview = DIV({
						style : {
							marginTop : 10
						},
					}), uploadInput = INPUT({
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
					}), uploadProgress = DIV({
						style : {
							fontSize : 14,
							color : '#666'
						}
					}), Yogurt.Textarea({
						style : {
							marginTop : 10
						},
						name : 'content',
						placeholder : '내용'
					}), Yogurt.Submit({
						style : {
							marginTop : 10
						},
						value : '작성 완료'
					})],
					on : {
						submit : (e, form) => {
							
							let data = form.getData();
							data.writerId = UserController.getSignedUserId();
							data.uploadFileServers = nowUploadFileServers;
							data.uploadFileIds = nowUploadFileIds;
							data.uploadFileURLs = nowUploadFileURLs;
							data.writeTime = firebase.database.ServerValue.TIMESTAMP;
							
							if (VALID.notEmpty(data.title) !== true) {
								Yogurt.Alert({
									msg : '제목은 필수입력임'
								});
							} else if (VALID.notEmpty(data.writerId) !== true) {
								Yogurt.Alert({
									msg : '유저 정보 로딩중임. 쪼까 있다가 다시 시도해주셈'
								});
							} else if (data.uploadFileURLs === undefined || data.uploadFileURLs.length === 0) {
								Yogurt.Alert({
									msg : '짤을 올려야지'
								});
							}
							
							else {
								
								form.setData({});
								uploadPreview.empty();
								nowUploadFileServers = [];
								nowUploadFileIds = [];
								nowUploadFileURLs = [];
								
								let ugayId = ugayRef.push(data).key;
								
								chatsRef.push({
									userId : UserController.getSignedUserId(),
									name : UserController.getSignedUserData().displayName,
									userIconURL : ConnectionController.getUserIconURL(),
									isUGay : true,
									title : data.title,
									ugayId : ugayId
								});
								
								UserController.increaseEXP(100);
							}
						}
					}
				}), list = DIV({
					style : {
						paddingBottom : 60
					}
				})]
			})]
		}).appendTo(Layout.getContent());
		
		// 로딩 이미지
		let loading = IMG({
			src : '/resource/loading.svg'
		}).appendTo(list);
		
		let ugayDataSet = [];
		
		// 새 유게짱이 추가되면
		ugayRef.on('child_added', (snapshot) => {
			loading.remove();
			
			let ugayData = snapshot.val();
			ugayData.key = snapshot.key;
			
			let item;
			let titlePanel;
			let contentPanel;
			let writerInfoPanel;
			list.prepend(item = DIV({
				style : {
					marginTop : 20
				},
				c : [P({
					style : {
						padding : '10px 0',
						borderBottom : '1px solid #999'
					},
					c : [titlePanel = SPAN({
						style : {
							flt : 'left'
						},
						c : '제목 : ' + ugayData.title
					}), writerInfoPanel = SPAN({
						style : {
							flt : 'right'
						},
						c : '작성자 정보 로딩중...'
					}), CLEAR_BOTH()]
				}), DIV({
					style : {
						padding : '10px 0'
					},
					c : RUN(() => {
						let imgs = [];
						EACH(ugayData.uploadFileURLs, (uploadFileURL) => {
							imgs.push(IMG({
								style : {
									display : 'block',
									maxWidth : '100%'
								},
								src : uploadFileURL
							}));
						})
						return imgs;
					})
				}), contentPanel = P({
					style : {
						padding : '10px 0',
						borderTop : '1px solid #999'
					},
					c : ugayData.content
				})]
			}));
			
			// 유저 정보 불러오기
			UserController.getUserData(ugayData.writerId, (writerData) => {
				writerInfoPanel.empty();
				
				if (writerData !== undefined) {
					
					let button;
					writerInfoPanel.append(button = UUI.BUTTON_H({
						icon : LoadIcon.getUserIconURL(ugayData.writerId) === undefined ? undefined : IMG({
							style : {
								width : 20,
								height : 20,
								borderRadius : 5
							},
							src : LoadIcon.getUserIconURL(ugayData.writerId)
						}),
						spacing : 6,
						title : writerData.name,
						on : {
							tap : () => {
								GO('user/' + ugayData.writerId);
							}
						}
					}));
					
					LoadIcon(ugayData.writerId, (url) => {
						button.setIcon(IMG({
							style : {
								width : 20,
								height : 20,
								borderRadius : 5
							},
							src : url
						}));
					});
					
					if (ugayData.writerId === UserController.getSignedUserId()) {
						
						titlePanel.after(A({
							style : {
								marginLeft : 10,
								color : '#666',
								fontSize : 14
							},
							c : '[제목 수정]',
							on : {
								tap : () => {
									
									Yogurt.Prompt({
										msg : '제목 입력하셈',
										value : ugayData.title
									}, (title) => {
										
										titlePanel.empty();
										titlePanel.append('제목 : ' + title);
										
										ugayData.title = title;
										ugayRef.child(ugayData.key).set(ugayData);
									});
								}
							}
						}));
						
						contentPanel.after(A({
							style : {
								color : '#666',
								fontSize : 14
							},
							c : '[내용 수정]',
							on : {
								tap : () => {
									
									Yogurt.Prompt({
										msg : '내용 입력하셈',
										value : ugayData.content
									}, (content) => {
										
										contentPanel.empty();
										contentPanel.append(content);
										
										ugayData.content = content;
										ugayRef.child(ugayData.key).set(ugayData);
									});
								}
							}
						}));
						
						item.append(DIV({
							style : {
								spadding : '10px 0',
								borderTop : '1px solid #999',
								color : '#666',
								fontSize : 14,
								textAlign : 'right'
							},
							c : A({
								c : '[글 삭제]',
								on : {
									tap : () => {
										
										Yogurt.Confirm({
											msg : '진짜 삭제함?'
										}, () => {
											item.remove();
											ugayRef.child(ugayData.key).remove();
										});
									}
								}
							})
						}));
					}
				}
			});
			
			// 오래된 유게이 삭제
			if (ugayDataSet.length > 100) {
				
				if (ugayDataSet[0].uploadFileId !== undefined) {
					ugayUploadsRef.child(ugayDataSet[0].uploadFileId).delete();
				}
				
				ugayRef.child(ugayDataSet[0].key).remove();
				ugayDataSet.shift();
			}
		});
		
		inner.on('close', () => {
			wrapper.remove();
		});
	}
});