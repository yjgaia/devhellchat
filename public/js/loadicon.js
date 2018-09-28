global.LoadIcon = METHOD((m) => {
	
	// Firebase Ref들 가져오기
	let iconsRef = firebase.storage().ref('icons');
	
	let userIconURLs = {};
	
	let getUserIconURL = m.getUserIconURL = (userId) => {
		return userIconURLs[userId];
	};
	
	return {
		
		run : (userId, callback) => {
			//REQUIRED: callback
			
			iconsRef.child(userId).getDownloadURL().then((url) => {
				console.log(url);
				userIconURLs[userId] = url;
				callback(url);
			}).catch(() => {
				// ignore.
			});
		}
	};
});