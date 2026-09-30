window.UNITS_MANIFEST = {
  unit1:{title:'Unit 1 Vocabulary',chapters:[
    {id:'ch1',number:1,title:'Chapter 1',available:true},
    {id:'ch2',number:2,title:'Chapter 2',available:true},
    {id:'ch3',number:3,title:'Chapter 3',available:true},
    {id:'ch4',number:4,title:'Chapter 4',available:true},
    {id:'ch5',number:5,title:'Chapter 5',available:true}
  ]},
  unit2:{title:'Unit 2 Vocabulary',chapters:[
    {id:'ch6',number:6,title:'Chapter 6',available:true},
    {id:'ch7',number:7,title:'Chapter 7',available:true},
    {id:'ch8',number:8,title:'Chapter 8',available:true},
    {id:'ch9',number:9,title:'Chapter 9',available:true},
    {id:'ch10',number:10,title:'Chapter 10',available:true}
  ]},
  unit3:{title:'Unit 3 Vocabulary',chapters:[
    {id:'ch11',number:11,title:'Chapter 11',available:true},
    {id:'ch12',number:12,title:'Chapter 12',available:true},
    {id:'ch13',number:13,title:'Chapter 13',available:true},
    {id:'ch14',number:14,title:'Chapter 14',available:true},
    {id:'ch15',number:15,title:'Chapter 15',available:true}
  ]},
  unit4:{title:'Unit 4 Vocabulary',chapters:[
    {id:'ch16',number:16,title:'Chapter 16',available:true},
    {id:'ch17',number:17,title:'Chapter 17',available:true},
    {id:'ch18',number:18,title:'Chapter 18',available:true},
    {id:'ch19',number:19,title:'Chapter 19',available:true},
    {id:'ch20',number:20,title:'Chapter 20',available:true}
  ]},
  unit5:{title:'Unit 5 Vocabulary',chapters:[
    {id:'ch21',number:21,title:'Chapter 21',available:false},
    {id:'ch22',number:22,title:'Chapter 22',available:false},
    {id:'ch23',number:23,title:'Chapter 23',available:false},
    {id:'ch24',number:24,title:'Chapter 24',available:false},
    {id:'ch25',number:25,title:'Chapter 25',available:false}
  ]},
  unit6:{title:'Unit 6 Vocabulary',chapters:[
    {id:'ch26',number:26,title:'Chapter 26',available:true},
    {id:'ch27',number:27,title:'Chapter 27',available:true},
    {id:'ch28',number:28,title:'Chapter 28',available:true},
    {id:'ch29',number:29,title:'Chapter 29',available:true},
    {id:'ch30',number:30,title:'Chapter 30',available:true}
  ]},
  unit7:{title:'Unit 7 Vocabulary',chapters:[
    {id:'ch31',number:31,title:'Chapter 31',available:true},
    {id:'ch32',number:32,title:'Chapter 32',available:true},
    {id:'ch33',number:33,title:'Chapter 33',available:true},
    {id:'ch34',number:34,title:'Chapter 34',available:true},
    {id:'ch35',number:35,title:'Chapter 35',available:true}
  ]},
  unit8:{title:'Unit 8 Vocabulary',chapters:[
    {id:'ch36',number:36,title:'Chapter 36',available:true},
    {id:'ch37',number:37,title:'Chapter 37',available:true},
    {id:'ch38',number:38,title:'Chapter 38',available:true},
    {id:'ch39',number:39,title:'Chapter 39',available:true},
    {id:'ch40',number:40,title:'Chapter 40',available:true}
  ]},
  unit9:{title:'Unit 9 Vocabulary',chapters:[
    {id:'ch41',number:41,title:'Chapter 41',available:true},
    {id:'ch42',number:42,title:'Chapter 42',available:true},
    {id:'ch43',number:43,title:'Chapter 43',available:true},
    {id:'ch44',number:44,title:'Chapter 44',available:true},
    {id:'ch45',number:45,title:'Chapter 45',available:true}
  ]},
  unit10:{title:'Unit 10 Vocabulary',chapters:[
    {id:'ch46',number:46,title:'Chapter 46',available:false},
    {id:'ch47',number:47,title:'Chapter 47',available:false},
    {id:'ch48',number:48,title:'Chapter 48',available:false},
    {id:'ch49',number:49,title:'Chapter 49',available:false},
    {id:'ch50',number:50,title:'Chapter 50',available:false}
  ]}
};

window.UnitsManifest = {
  listUnits() {
    return Object.keys(window.UNITS_MANIFEST);
  },

  getUnit(id) {
    return window.UNITS_MANIFEST[id] || null;
  },

  listChapters(id) {
    const unit = this.getUnit(id);
    return unit ? unit.chapters : [];
  },

  getChapter(unitId, chapterId) {
    return this.listChapters(unitId)
      .find(chapter => chapter.id === chapterId) || null;
  },

  getAvailableChapters(id) {
    return this.listChapters(id)
      .filter(chapter => chapter.available);
  },

  getNextAvailableChapter(unitId, currentChapterId) {
    const chapters = this.listChapters(unitId);
    const index = chapters.findIndex(
      chapter => chapter.id === currentChapterId
    );

    for (let next = index + 1; next < chapters.length; next += 1) {
      if (chapters[next].available) return chapters[next];
    }

    return null;
  }
};
