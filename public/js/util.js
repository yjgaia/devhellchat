global.UTIL = {

	champiFilter : (str) => {
		[
			'[데대] *[뎃댓](?!글)',
			'ㄷ *[ㅔㅐ] *[뎃댓](?!글)',
			'[뎃댓뎄댔] *[데대](?!요)',
			'[뎃댓] *ㄷ *[ㅔㅐ](?!요)',
			'[닌닝] *겐 *상',
			'프 *니 *프 *니',
			'프 *[ㄴL└] *[1liIㅣ\\|]',
			'픈 *이 *픈 이',
			'([^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]|^)쿠 *[이잉엥앵]',
			'쿠 *[Oo0] *[1liIㅣ\\|]',
			'[테텟태탯뭇믓믖뭊뭋믗테쿠] *[챠치]',
			'[데뎃대댓] *[스승숭송슝슁쉥] *($|우|웅|앙|양|앵|엥|엉|융|옹|용|얭|옝)',
			'[레래뢰뇌뤠] *[후휴휘훼휑휭힝훙흉횽횡]+ *[에애]* *[엥앵]?',
			'[ㄹ근] *[ㅔㅐ] *[후휴휘훼휑휭힝훙흉횽횡]+ *[에애]* *[엥앵]?',
			'[붕븡봉븅뵹] *[쯔쭈쮸쪼쬬]',
			'[뎃데대댓텟톗테탯턧] *[샤츄츙치챠촤취췽췡]',
			'r *e *h *u',
			'[세새셀셸샐섈] *[에애레래] *[브부뷰뷔보뵤]',
			'ㅅ *ㅔ *[레래] *[브부뷰뷔보뵤]',
			'ㅅ *ㅔ ㄹ *[ㅔㅐ] *[브부뷰뷔보뵤]',
			'세 *ㄹ *ㅔ *브',
			'[데테대태퇴퇘퉤] *[에애]* *[엥샷샤]앗?',
			'[ㄷㅌ] *[ㅔㅐㅞ] *[에애]* *[엥샷샤]앗?',
			'인 *간 *씨',
			'[와왓왔] *[타따] *[시치]',
			'[레래렛랫] *[삐뺘] *앗?',
			'[쿠꾸큐뀨] *[우]* *[이E]',
			'<\\(', '\\)>',
			'[Ooㅇ0~\^][AАДдＡΑÄ][Ooㅇ0~\^]',
			'[똥똔뚄] *[닌닝뉭닁뉜] *[겐갠궨]',
			'파 *-* *킨',
		].forEach((v) => {
			str = str.replace((new RegExp(v, 'g')), '.');
		});
		return str.replace(/(됫|됬)/g, '됐');
	}
};