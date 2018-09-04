global.CheckLogin = METHOD((m) => {
	
	let user;
	
	let getUser = m.getUser = () => {
		return user;
	};
	
	return {
		
		run : (callback) => {
			//REQUIRED: callback
			
			// 로그인 체크
			firebase.auth().onAuthStateChanged((_user) => {
				
				// 로그인 화면
				if (_user === TO_DELETE) {
					
					let authContainer = DIV({
						style : {
							onDisplayResize : (width) => {
								if (width <= 480) {
									return {
										padding : 0
									};
								} else {
									return {
										padding : '20px 0'
									};
								}
							}
						}
					}).appendTo(Layout.getContent());
					
					// 인증 처리
					new firebaseui.auth.AuthUI(firebase.auth()).start(authContainer.getEl(), {
						signInOptions : [
							firebase.auth.EmailAuthProvider.PROVIDER_ID
						],
						callbacks : {
							signInSuccessWithAuthResult : (authResult) => {
								authContainer.remove();
								
								if (user === undefined) {
									user = authResult.user;
									callback(user);
								}
								
								return false;
							}
						}
					});
				}
				
				else if (user === undefined) {
					user = _user;
					callback(user);
				}
			});
		}
	};
});