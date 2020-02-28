const SITE_URL = $('#site_url').val();

// Start of creating a map
var options = {
  center: new kakao.maps.LatLng(37.541272, 126.989387),
  level: 8
}
var container = document.getElementById('map');
var map = new kakao.maps.Map(container, options);

if (navigator.geolocation) {
  //Move center of the map when geolocation can get a location.
  // GeoLocation을 이용해서 접속 위치를 얻어옵니다
  navigator.geolocation.getCurrentPosition(function(position) {

    var lat = position.coords.latitude // 위도
    var lng = position.coords.longitude // 경도
    var center = new kakao.maps.LatLng(lat, lng)
    map.setCenter(center)
    map.setLevel(4)
  })
}
setLoading(false)
// End of creating a map

function setLoading(status) {
  if(status == false) {
    $('.loading').css('display', 'none')
  } else {
    $('.loading').css('display', 'block')
  }
}

function deleteMarker() {
  var m_id = $('#m_id').val()
  var auth = prompt('등록하실때 입력한 비밀번호를 입력해주세요')

  if(!auth) {
    alert("비밀번호를 입력해주세요")
  } else {
    const url = 'http://' + SITE_URL + '/marker/' + m_id + '?auth=' + auth;
    fetch(url, {
      method: 'DELETE'
    })
      .then(function(res) {
        return res.json()
      })
      .then(function(status) {
        if(status.res == 'SUCCESS') {
          alert("성공적으로 삭제를 완료했습니다.")
          window.location.reload()
        } else {
          alert("삭제중 오류가 발생했습니다. 비밀번호를 확인해주세요.")
        }
      })
  }
}

function drawMarker(info) {
  var findingImage = '/img/finding.png'
  var foundImage = '/img/found.png'
  var imageSize = new kakao.maps.Size(45, 45)
  var imageOption = {offset: new kakao.maps.Point(22, 44)}
  var position = new kakao.maps.LatLng(info.latitude, info.longitude)

  if(info.type === 'found') {
    var foundMarkerImage = new kakao.maps.MarkerImage(foundImage, imageSize, imageOption)

    var marker = new kakao.maps.Marker({
      map: map,
      position: position,
      image: foundMarkerImage
    })
    //return marker
  } else if(info.type === 'finding') {
    var findingMarkerImage = new kakao.maps.MarkerImage(findingImage, imageSize, imageOption)

    var marker = new kakao.maps.Marker({
      map: map,
      position: position,
      image: findingMarkerImage
    })
    //return marker
  } else {
    alert("Failed to draw a marker.")
    //return false
  }

  kakao.maps.event.addListener(marker, 'click', function() {
    //closeOverlays()
    //overlay.setMap(map)

    var infoTypeString = '로딩중 문제가 발생했습니다.'
    var infoFtimeString = '로딩중 문제가 발생했습니다.'
    var f_time = info.f_time
    f_time = f_time.replace('T', ' ')
    f_time = f_time.replace(':00.000Z', '')
    if(info.type == 'finding') {
      infoTypeString = '제 반려동물좀 찾아주세요..'
      infoFtimeString = '실종 시간 : ' + f_time
    } else if(info.type == 'found') {
      infoTypeString = '주인을 잃어버린거 같아요.!'
      infoFtimeString = '발견 시간 : ' + f_time
    }

    $('#info-f-time').text(infoFtimeString)
    $('#info-type').text(infoTypeString)
    $('#info-img').attr('src', info.img_url)
    $('#info-comment').text(info.comment)
    $('#infoModal').modal()
    $('#infoModal').css('visibility', 'hidden')
    setLoading(true)
    $('#info-img').on('load', function() {
      setTimeout(function() {
        const img_height = $('#info-img').height()
        const comment_height = $('#info-comment').height()
        const calc = 'calc(' + img_height + 'px + ' + comment_height + 'px + 50px)'
        console.log(calc)
        $('#info-body').css('height', calc)
        $('#m_id').val(info.m_id)
        setLoading(false)
        $('#infoModal').css('visibility', 'visible')
      }, 350)
    })
    /*setTimeout(function() {
        const img_height = $('#info-img').height()
        const comment_height = $('#info-comment').height()
        const calc = 'calc(' + img_height + 'px + ' + comment_height + 'px + 50px)'
        console.log(calc)
        $('#info-body').css('height', calc)
        $('#m_id').val(info.m_id)
        setLoading(false)
        $('#infoModal').css('visibility', 'visible')
    }, 1450)*/


  })

  // return marker or false when failed

  return marker ? marker : false

}



// Start of loading markers from server.
var found = [], finding = []
var found_m = [], finding_m = []
fetch('http://' + SITE_URL + '/marker')
  .then(function(res) {
    return res.json()
  })
  .then(function(data) {
    finding = data.filter(function(d) {
      return d.type == 'finding'
    })

    found = data.filter(function(d) {
      return d.type == 'found'
    })

    for (var i = 0; i < finding.length; i++) {
      var marker_info = finding[i]
      finding_m.push(drawMarker(marker_info))
    }

    for (var i = 0; i < found.length; i++) {
      var marker_info = found[i]
      found_m.push(drawMarker(marker_info))
    }
  })

function markerSwitch(type) {
  var finding_map, found_map
  if(type == 'all') {
    finding_map = map
    found_map = map
  } else if(type == 'finding') {
    finding_map = map
    found_map = null
  } else if(type == 'found') {
    finding_map = null
    found_map = map
  } else {
    return
  }

  for (var i = 0; i < finding_m.length; i++) {
    finding_m[i].setMap(finding_map)
  }
  for (var i = 0; i < found_m.length; i++) {
    found_m[i].setMap(found_map)
  }
}

//Event Lister when the map is clicked.
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
  var latlng = mouseEvent.latLng
  $('#mouseLat').val(latlng.getLat())
  $('#mouseLng').val(latlng.getLng())
  $('#insertModal').modal()
  //drawMarker(latlng.getLat(), latlng.getLng(), 'found')
})



function addNewMarker() {
  var lat = $('#mouseLat').val()
  var lng = $('#mouseLng').val()
  var type = $('#marker-type option:selected').val()
  var comment = $('#comment').val()
  var f_time = $('#f_time').val()

  if(($('#img-file').val() != '') && (lat != '') && (lng != '') && (type != '') && (comment != '')) {
    const reg = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/
    var isValidDate = reg.test(f_time)
    if(!isValidDate) {
      $('#f_time').val('올바른 날짜와 시간을 입력해주세요.')
      alert('유효한 날짜와 시간을 입력해주세요.')
    } else {
      var auth = prompt("삭제하실때 이용할 비밀번호를 입력해주세요.(4글자 이상)")
      if(auth.length < 4) {
        alert("4글자 이상의 비밀번호를 입력해주세요.")
      } else {
        var input = document.querySelector('input[type="file"]')
        var data = new FormData()
        data.append('latitude', lat)
        data.append('longitude', lng)
        data.append('type', type)
        data.append('comment', comment)
        data.append('img', input.files[0])
        data.append('f_time', f_time)
        data.append('auth', auth)

        fetch('http://' + SITE_URL + '/marker', {
          method: 'POST',
          body: data
        })
          .then(function(res) {
            return res.json()
          })
          .then(function(data) {
            if(data.res == 'SUCCESS') {
              var marker = drawMarker(data)
              if(data.type == 'finding') {
                finding.push(data)
                finding_m.push(marker)
              } else if(data.type == 'found') {
                found.push(data)
                found_m.push(marker)
              } else {
                alert("마커 추가를 완료하였습니다. 정상적인 검색기능 위해 새로고침 부탁드립니다.")
              }

            } else {
              alert("마커를 추가하는 중에 문제가 발생했습니다.")
            }
          })
          .finally(function() {
            // reset all input data in Modal
            $('#comment').val('')
            $('#img-file').val('')
            $('.custom-file-label').addClass("selected").html('발견한 사진을 추가해주세요')
            $('#marker-type').val('finding')
            $('#mouseLat').val('')
            $('#mouseLng').val('')
            $('#f_time').val('')
            $('#insertModal').modal('hide')
            $('#btn-add').css('display','block')
            $('#btn-add-close').css('display','block')
            $('#auto-close').css('visibility', 'hidden')
          })
        $('#btn-add').css('display','none')
        $('#btn-add-close').css('display','none')
        $('#auto-close').css('visibility', 'visible')
        alert("서버에 업로드중입니다. 페이지를 나가거나 새로고침 하지 마세요.")
      }
    }
  }

}

function searchMarker() {
  const word = $('#search-word').val()
  console.log(word)

  var idxOfFinding = []
  var idxOfFound = []

  for(var i = 0; i < finding.length; i++) {
    //if(finding[i].comment.includes(word)) {
    if(finding[i].comment.indexOf(word) != -1) {
      idxOfFinding.push(i)
    }
  }

  for(var i = 0; i < found.length; i++) {
    //if(found[i].comment.includes(word)) {
    if(found[i].comment.indexOf(word) != -1) {
      idxOfFound.push(i)
    }
  }


  if(!(idxOfFound.length == 0 && idxOfFinding.length == 0)) {
    for (var i = 0; i < finding_m.length; i++) {
      finding_m[i].setMap(null)
    }
    for (var i = 0; i < found_m.length; i++) {
      found_m[i].setMap(null)
    }

    for (var i = 0; i < idxOfFinding.length; i++) {
      var idx = idxOfFinding[i]
      finding_m[idx].setMap(map)
    }
    for (var i = 0; i < idxOfFound.length; i++) {
      var idx = idxOfFound[i]
      found_m[idx].setMap(map)
    }
    var total = idxOfFound.length + idxOfFinding.length
    alert(String(total) + "개의 마커가 검색되었습니다.")
  } else {
    alert("검색 결과가 존재하지 않습니다.")
  }
  $('#search-word').val('')
}
