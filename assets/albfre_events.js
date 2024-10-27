(function (window) {
  var liveEvents = []

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  function getEventStartDate (startDate) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    var date = new Date(startDate)
    return {
      day: date.getDate(),
      month: monthNames[date.getMonth()],
      year: date.getFullYear(),
      time: formatAMPM(date)
    }
  }

  function dateIsAfterToday (date) {
    var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    tomorrow.setHours(0,0,0,0)
    return date >= tomorrow
  }

  function dateIsBeforeToday (date) {
    var today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  function dateIsSameToday (date) {
    var today = new Date()
    return (date.getDate() == today.getDate()
    && date.getMonth() == today.getMonth()
    && date.getFullYear() == today.getFullYear())
  }

  function getNextEvents (events) {
    for (var i = 0; i < events.length; i++) {
      var event = events[i]
      if (event.status === 'live' || (event.status !== 'done' && dateIsSameToday(new Date(event.startDate))) || dateIsAfterToday(new Date(event.startDate))) {
        if (event.status === 'live') {
          event.badge = {
            id: 'live',
            name: albfre_events_object.albfre_translations['LIVE']
          }
        } else if (dateIsSameToday(new Date(event.startDate))) {
          event.badge = {
            id: 'today',
            name: albfre_events_object.albfre_translations['TODAY']
          }
        } else if (dateIsAfterToday(new Date(event.startDate))) {
          event.badge = {
            id: 'upcoming',
            name: albfre_events_object.albfre_translations['UPCOMING']
          }
        }
        liveEvents.push(event)
      }
    }

    return liveEvents
  }

  function createEmptyState () {
    var $ = jQuery
    var listEl = document.querySelector('.albfre-list-events--list')
    var $listEl = $(listEl)

    $listEl.append(
      $('<div class="albfre-events--empty"></div>').append(
        $('<div class="albfre-events--empty--icon">📅</div>'),
        $('<div class="albfre-events--empty--title">'+albfre_events_object.albfre_translations['EMPTY_TITLE']+'</div>'),
        $('<div class="albfre-events--empty--subtitle">'+albfre_events_object.albfre_translations['EMPTY_SUBTITLE']+'</div>'),
        $('<a href="'+albfre_events_object.albfre_dashboard+'" target="_blank" class="albfre-events--empty--btn">'+albfre_events_object.albfre_translations['EMPTY_BUTTON']+'</a>')
      )
    )
  }

  function createEventElement (event) {
    var $ = jQuery
    var listEl = document.querySelector('.albfre-list-events--list')
    var $listEl = $(listEl)

    var startDate = getEventStartDate(event.startDate)
    var nameStyle = ''
    if (event.badge.name.length >= 7) {
      nameStyle = 'font-size: 9px'
    }

    var slug = '' + event.slug

    var isFirestore = event.isFirestore

    var publisherSlug = event.site.slug

    var avataImage
    if (event.avatarImage) {
      avataImage = event.avatarImage
    } else if (event.officialEvent && event.officialEvent.image) {
      avataImage = event.officialEvent.image
    } else {
      avataImage = 'https://dashboard.arena.im/img/empty-photo-event.png'
    }

    $listEl.append(
      $('<div class="albfre-events--item--wrapper"></div>').append(
        $('<div class="albfre-events-badge--wrapper"></div>').append(
          $('<div class="albfre-events-upcoming-wrapper"></div>').append(
            $('<div class="albfre-events-badge albfre-events-badge-'+event.badge.id+' " style="'+nameStyle+'">'+event.badge.name+'</div>')
          ),
          $('<div class="albfre-events-badge--date"></div>').append(
            $('<div class="albfre-events-badge--date--day ">'+startDate.day+'</div>'),
            $('<div class="albfre-events-badge--date--month ">'+startDate.month+'</div>'),
            $('<div class="albfre-events-badge--date--hour ">'+startDate.time+'</div>')
          )
        ),
        $('<div class="albfre-events--item--container"></div>').append(
          $('<div class="albfre-events--item"></div>').append(
            (event.officialEvent && event.officialEvent.competitors && Array.isArray(event.officialEvent.competitors) && event.officialEvent.competitors.length > 0) ?
            $('<div class="albfre-events--item--match"></div>').append(
              $('<div class="albfre-events--item--team"></div>').append(
                $('<div class="albfre-events--item--team--logo" style="background: url('+event.officialEvent.competitors[0].image+') center center / contain no-repeat;"></div>'),
                $('<div class="albfre-events--item--team--name">'+event.officialEvent.competitors[0].abbreviation+'</div>')
              ),
              $('<div class="albfre-events--item--match--vs">x</div>'),
              $('<div class="albfre-events--item--team"></div>').append(
                $('<div class="albfre-events--item--team--logo" style="background: url('+event.officialEvent.competitors[1].image+') center center / contain no-repeat;"></div>'),
                $('<div class="albfre-events--item--team--name">'+event.officialEvent.competitors[1].abbreviation+'</div>')
              )
            ) : $('<div class="albfre-events--item--img" style="background: url('+avataImage+') center center / cover"></div>'),
            $('<div class="albfre-events--item--info--wrapper"></div>').append(
              $('<div class="albfre-events--item--info"></div>').append(
                $('<div class="albfre-events--item--info--title" href="/live/miami-heat-vs-atlanta-hawks">' + event.name + '</div>'),
                $('<div class="albfre-events--item--subinfo"></div>').append(
                  $('<div class="albfre-events--item--info--subtitle">'+(event.tournament ? event.tournament.name : '')+'</div>')
                )
              ),
              $('<div class="albfre-events--item--ctas btn-toolbar"></div>').append(
                $('<select onchange="window.albfreWPPlugin.handleTypeChange(this)" class="albfre-events--item--info--ctas--type albfre-events--item--info--ctas--type-'+slug+'"></select>').append(
                  $('<option value="embed">Embed</select>'),
                  $('<option value="amp">AMP</select>'),
                  $('<option value="iframe">iframe</select>')
                ),
                $('<div type="button" class="albfre-btn albfre-btn-arena-secondary" onclick="window.albfreWPPlugin.addCode({publisherSlug: \''+publisherSlug+'\', slug: \''+slug+'\', isFirestore: '+isFirestore+'})"><span>'+albfre_events_object.albfre_translations['ADD']+'</span></div>')
              )
            )
          ),
          $('<div class="albfre-events--item--size"></div>').append(
            $('<div class="albfre-events--item--size--item albfre-events--item--size--width"></div>').append(
              $('<span class="albfre-events--item--size--item--label">Width</span>'),
              $('<input type="text" class="albfre-events--item--size--item--input albfre-events--item--size-width-'+slug+'" value="400" />'),
              $('<input type="checkbox" class="albfre-events--item--size--item--check albfre-events--item--size-width-100-'+slug+'" onchange="window.albfreWPPlugin.handleCheck100(this)" />'),
              $('<span class="albfre-events--item--size--item--hundred">100%</span>')
            ),
            $('<div class="albfre-events--item--size--item"></div>').append(
              $('<span class="albfre-events--item--size--item--label">Height</span>'),
              $('<input type="text" class="albfre-events--item--size--item--input albfre-events--item--size-height-'+slug+'" value="400" />'),
              $('<input type="checkbox" class="albfre-events--item--size--item--check albfre-events--item--size-height-100-'+slug+'" onchange="window.albfreWPPlugin.handleCheck100(this)" />'),
              $('<span class="albfre-events--item--size--item--hundred">100%</span>')
            )
          )
        )
      )
    )
  }

  function handleCheck100 (check) {
    if (check.checked) {
      check.parentNode.querySelector('.albfre-events--item--size--item--input').setAttribute('disabled', true)
    } else {
      check.parentNode.querySelector('.albfre-events--item--size--item--input').removeAttribute('disabled')
    }
  }

  function handleTypeChange (select) {
    const container = select.parentNode.parentNode.parentNode.parentNode
    const sizeEl = container.querySelector('.albfre-events--item--size')
    if (select.value === 'iframe' || select.value === 'amp') {
      sizeEl.style.display = 'flex'
    } else {
      sizeEl.style.display = 'none'
    }

    const inputEls = container.querySelectorAll('.albfre-events--item--size--item--input')
    const checkEls = container.querySelectorAll('.albfre-events--item--size--item--check')
    const hundredEls = container.querySelectorAll('.albfre-events--item--size--item--hundred')
    const widthEl = container.querySelector('.albfre-events--item--size--width')
    if (select.value === 'amp') {
      checkEls.forEach(function (checkEl) {
        checkEl.style.display = 'none'
        checkEl.checked = false
      })

      hundredEls.forEach(function (hundredEl) {
        hundredEl.style.display = 'none'
      })

      widthEl.style.display = 'none'
    } else {
      checkEls.forEach(function (checkEl) {
        checkEl.style.display = 'inline-block'
        checkEl.checked = false
      })

      hundredEls.forEach(function (hundredEl) {
        hundredEl.style.display = 'inline-block'
      })

      widthEl.style.display = 'block'
    }

    inputEls.forEach(function (inputEl) {
      inputEl.value = '400'
    })
  }

  function addCode (event) {
    var embedTypeEl = document.querySelector('.albfre-events--item--info--ctas--type-' + event.slug)
    var embedType = embedTypeEl.value

    var getSize = function (postfix) {
      var userWidth100 = document.querySelector('.albfre-events--item--size-width-100-' + event.slug)
      var userWidth = document.querySelector('.albfre-events--item--size-width-' + event.slug)

      var width = '100%'
      if (!userWidth100.checked) {
        width = userWidth.value + postfix
      }

      var userHeight100 = document.querySelector('.albfre-events--item--size-height-100-' + event.slug)
      var userHeight = document.querySelector('.albfre-events--item--size-height-' + event.slug)

      var height = '100%'
      if (!userHeight100.checked) {
        height = userHeight.value + postfix
      }

      return {width: width, height: height}
    }

    var version = 1
    if (event.isFirestore) {
      version = 2
    }

    var embedCode
    if (embedType === 'amp') {
      var size = getSize('')

      embedCode = "[arena_embed_amp version=\"" + version + "\" publisher=\"" + event.publisherSlug + "\" event=\"" + event.slug + "\" height=\"" + size.height + "\"]"
    } else if (embedType === 'iframe') {
      var size = getSize('px')

      embedCode = "[arena_embed_iframe version=\"" + version + "\" publisher=\"" + event.publisherSlug + "\" event=\"" + event.slug + "\" width=\"" + size.width + "\" height=\"" + size.height + "\"]"
    } else {
      embedCode = "[arena_embed version=\"" + version + "\" publisher=\"" + event.publisherSlug + "\" event=\"" + event.slug + "\"]"
    }

    if (parent.tinyMCE !== null && parent.tinyMCE.activeEditor !== null && !parent.tinyMCE.activeEditor.isHidden()) {
      if (typeof parent.tinyMCE.execInstanceCommand !== 'undefined') {
        parent.tinyMCE.execInstanceCommand(
                window.tinyMCE.activeEditor.id,
                'mceInsertContent',
                false,
                embedCode);
      } else {
        parent.send_to_editor(embedCode);
      }
    } else {
      if (typeof parent.QTags.insertContent === 'function') {
        parent.QTags.insertContent(embedCode);
        parent.tb_remove();
      } else {
        parent.send_to_editor(embedCode);
      }
    }
  }

  function removeSinalChar (str) {
    var sinalMapHex 	= {
      a : /[\xE0-\xE6]/g,
      e : /[\xE8-\xEB]/g,
      i : /[\xEC-\xEF]/g,
      o : /[\xF2-\xF6]/g,
      u : /[\xF9-\xFC]/g,
      c : /\xE7/g,
      n : /\xF1/g
    }

    for ( var char in sinalMapHex ) {
      var regex = sinalMapHex[char];
      str = str.replace(regex, char);
    }

    return str;
  }

  function handleSearchKeyup (event) {
    var search = event.target.value.split(' ')
    var listEl = document.querySelector('.albfre-list-events--list')
    listEl.innerHTML = ''

    for (var i = 0; i < liveEvents.length; i++) {
      var found = 0
      for (var j = 0; j < search.length; j++) {
        if (removeSinalChar(liveEvents[i].name.toLowerCase()).indexOf(removeSinalChar(search[j].toLowerCase())) >= 0) {
          found++
        }
      }

      if (found === search.length) {
        createEventElement(liveEvents[i])
      }
    }
  }

  function refreshPage () {
    window.location.reload();
  }

  window.albfreWPPlugin = {
    handleCheck100: handleCheck100,
    createEmptyState: createEmptyState,
    getNextEvents: getNextEvents,
    handleSearchKeyup: handleSearchKeyup,
    addCode: addCode,
    handleTypeChange: handleTypeChange,
    createEventElement: createEventElement,
    refreshPage: refreshPage
  }
})(window)

jQuery(function() {
  var apiEventsURL = albfre_events_object.albfre_api_events_url
  var token = albfre_events_object.albfre_user_token

  if (!token) return

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": apiEventsURL,
    "method": "GET",
    "headers": {
      "authorization": "Bearer " + token,
      "content-type": "application/json"
    },
    "processData": false
  }

  jQuery.ajax(settings).done(function (events) {
    var listEl = document.querySelector('.albfre-list-events--list')
    listEl.innerHTML = ''
    events = window.albfreWPPlugin.getNextEvents(events)
    for (var i = 0; i < events.length; i++) {
      window.albfreWPPlugin.createEventElement(events[i])
    }

    if (events.length === 0) {
      window.albfreWPPlugin.createEmptyState()
    }
  });
})

