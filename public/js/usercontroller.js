global.UserController = OBJECT({
	
	init : (inner, self) => {
		
		// Firebase Ref들 가져오기
		let usersRef = firebase.database().ref('users');
		
		let userDataCache = {};
		
		// 유저 정보 반환
		let getUserData = self.getUserData = (userId, callback) => {
			//REQUIRED: userId
			//REQUIRED: callback
			
			if (userDataCache[userId] !== undefined) {
				callback(userDataCache[userId]);
			}
			
			else {
				
				usersRef.child(userId).once('value', (snapshot) => {
					let userData = snapshot.val() === TO_DELETE ? undefined : snapshot.val();
					if (userData !== undefined) {
						userDataCache[userId] = userData;
					}
					callback(userData);
				});
			}
		};
		
		let signedUserData;
		let getSignedUserData = self.getSignedUserData = () => {
			return signedUserData;
		};
		
		let signedUserId;
		let getSignedUserId = self.getSignedUserId = () => {
			return signedUserId;
		};
		
		// 컨트롤러를 초기화합니다.
		let init = self.init = (user) => {
			signedUserData = user;
			signedUserId = user.uid;
			
			let userRef = usersRef.child(user.uid);
			
			userRef.once('value', (snapshot) => {
				
				let userData = snapshot.val();
				if (userData === TO_DELETE) {
					userData = {};
				}
				
				// 데이터 초기화
				if (userData.level === undefined) {
					userData.level = 1;
				}
				if (userData.exp === undefined) {
					userData.exp = 0;
				}
				if (userData.coin === undefined) {
					userData.coin = 0;
				}
				
				userData.name = user.displayName;
				userRef.set(userData);
			});
			
			// 경험치 증가
			let increaseEXP = self.increaseEXP = (exp) => {
				//REQUIRED: exp
				
				userRef.transaction((userData) => {
					if (userData !== TO_DELETE) {
						userData.exp += exp;
						
						// 레벨을 계산합니다.
						let needExp = 0;
						let resultLevel = 0;
						
						REPEAT({
							start : 1,
							end : 9999
						}, (level) => {
							
							needExp += 10 * (level - 1) * (level - 1) * level;
							
							if (userData.exp >= needExp) {
								resultLevel = level;
							} else {
								return false;
							}
						});
						
						// 레벨 업!
						if (userData.level < resultLevel) {
							ChatController.addSystemMessage('레벨 업!', '레벨이 ' + resultLevel + '이 되었음ㅋㅋ 기모띠');
							
							userData.coin += resultLevel * 10;
						}
						
						userData.coin += exp;
						userData.level = resultLevel;
						
						if (userDataCache[signedUserId] !== undefined) {
							userDataCache[signedUserId].exp = userData.exp;
							userDataCache[signedUserId].level = userData.level;
							userDataCache[signedUserId].coin = userData.coin;
						}
					}
					return userData;
				});
			};
			
			// 자기 소개 수정
			let updateIntroduce = self.updateIntroduce = (intoduce) => {
				
				userRef.update({
					introduce : intoduce
				});
				
				if (userDataCache[signedUserId] !== undefined) {
					userDataCache[signedUserId].intoduce = intoduce;
				}
			};
		};
	}
});