function renderList(data) {
  var html = getListHtml(data);
  document.getElementById("rhymes").innerHTML = html;
}

function getListHtml(data) {
  return data.map(getItemHtml).join("");
}

function getItemHtml(rhyme) {
  return "<li class='list-group-item' style='width: 12em'><span class='badge'>" + 
    rhyme.score + "</span>" + rhyme.word + "</li>";
}


function renderWord(word) {
  document.getElementById("word").innerHTML = word;
}

renderWord("force");

renderList([{"word":"source","freq":25,"score":300,"flags":"bc","syllables":"1"},
 {"word":"horse","freq":24,"score":300,"flags":"bc","syllables":"1"},
 {"word":"course","freq":26,"score":300,"flags":"bc","syllables":"1"},
 {"word":"forth","freq":24,"score":264,"flags":"bc","syllables":"1"},
 {"word":"north","freq":24,"score":264,"flags":"bc","syllables":"1"},
 {"word":"walls","freq":24,"score":264,"flags":"bc","syllables":"1"},
 {"word":"thoughts","freq":24,"score":228,"flags":"bc","syllables":"1"},
 {"word":"loss","freq":25,"score":228,"flags":"bc","syllables":"1"},
 {"word":"cross","freq":24,"score":228,"flags":"bc","syllables":"1"},
 {"word":"across","freq":25,"score":228,"flags":"bc","syllables":"2"},
 {"word":"reports","freq":24,"score":228,"flags":"bc","syllables":"2"},
 {"word":"off","freq":26,"score":192,"flags":"bc","syllables":"1"},
 {"word":"forms","freq":25,"score":192,"flags":"bc","syllables":"1"},
 {"word":"laws","freq":25,"score":192,"flags":"bc","syllables":"1"},
 {"word":"because","freq":27,"score":192,"flags":"bc","syllables":"2"},
 {"word":"towards","freq":25,"score":192,"flags":"bc","syllables":"2"},
 {"word":"records","freq":24,"score":192,"flags":"bc","syllables":"2"},
 {"word":"books","freq":25,"score":84,"flags":"bc","syllables":"1"},
 {"word":"notes","freq":24,"score":84,"flags":"bc","syllables":"1"},
 {"word":"close","freq":25,"score":84,"flags":"bc","syllables":"1"}]);