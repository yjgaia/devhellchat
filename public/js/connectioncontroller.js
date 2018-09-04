global.ConnectionController = OBJECT({
	
	init : (inner, self) => {
		
		// Firebase Ref들 가져오기
		let connectionsRef = firebase.database().ref('connections');
		
		// 로그인한 유저의 아이콘
		let userIconURL = 'resource/default-icon.png';
		let getUserIconURL = self.getUserIconURL = () => {
			return userIconURL;
		};
		
		// 최근 접속 유저들
		let recentlyUsers = [];
		let getRecentlyUsers = self.getRecentlyUsers = () => {
			return recentlyUsers;
		};
		
		// 컨트롤러를 초기화합니다.
		let init = self.init = (user) => {
			
			// 로그인한 유저의 아이콘을 가져옵니다.
			LoadIcon(user.uid, (url) => {
				userIconURL = url;
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
							//TODO:
						}
					}
				});
				
				Layout.setRecentlyUsers(recentlyUsers);
				
				if (isFirstShowingRecentlyUsers === true) {
					isFirstShowingRecentlyUsers = false;
					ChatController.showRecentlyUsers();
				}
			});
		};
	}
});