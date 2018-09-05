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
							paddingBottom : 20
						},
						c : AboutPanel({
							style : {
								marginBottom : 20
							}
						})
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