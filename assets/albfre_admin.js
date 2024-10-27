(function (window) {
  var userAccounts = null
  function arenaLogin() {
    var emailInput = document.querySelector('.albfre-settings--email')
    var passwordInput = document.querySelector('.albfre-settings--password')

    var email = sanitize(emailInput.value)
    var password = sanitize(passwordInput.value)

    if (!validateEmail(email)) {
      pageBodyLogin.style.display = 'block'
      pageLoading.style.display = 'none'
      emailInput.style.border = '1px dotted #cc5965'

      var errorLabel = document.querySelector('.albfre-form--error')
      errorLabel.style.display = 'block'
      return
    }

    var settings = {
      async: true,
      crossDomain: true,
      url: albfre_settings_object.albfre_api_signin_url,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      processData: false,
      dataType: "json",
      data: JSON.stringify({ email: email, password: password })
    }

    var pageBodyLogin = document.querySelector('.albfre-settings--body--login')
    var pageLoading = document.querySelector('.albfre-settings--body--sp')

    pageBodyLogin.style.display = 'none'
    pageLoading.style.display = 'block'

    if (typeof window.fetch === 'function') {
      fetch(settings.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: settings.data
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          receiveUser(data)
        })
        .catch(rejectedReceiveUser)
    } else {
      jQuery.ajax(settings).done(receiveUser).fail(rejectedReceiveUser)
    }

    function receiveUser(response) {
      var accountObj = findFirstAccountOrganizationSite(response.user.accounts)

      var user = {
        displayName: response.user.name,
        arenaApiToken: response.arenaToken,
        siteId: accountObj.site._id,
        accountId: accountObj.account._id,
        accounts: '' + JSON.stringify(response.user.accounts)
      }

      var data = {
        'action': 'albfre_user_action',
        'albfre_user': user
      };

      jQuery.post(albfre_settings_object.ajax_url, data, function (response) {
        window.location.reload();
      })
    }

    function rejectedReceiveUser() {
      pageBodyLogin.style.display = 'block'
      pageLoading.style.display = 'none'
      emailInput.style.border = '1px dotted #cc5965'
      passwordInput.style.border = '1px dotted #cc5965'

      var errorLabel = document.querySelector('.albfre-form--error')
      errorLabel.style.display = 'block'
    }
  }

  function arenaLogout() {
    var data = {
      'action': 'albfre_logout_action'
    };

    var pageBody = document.querySelector('.albfre-settings--body')
    pageBody.innerHTML = ''

    jQuery(pageBody).append('<div class="albfre-sp albfre-sp-circle"></div>')

    jQuery.post(albfre_settings_object.ajax_url, data, function (response) {
      window.location.reload();
    });
  }

  function arenaHandleKeydown(event) {
    event = event || window.event
    switch (event.which || event.keyCode) {
      // ENTER
      case 13: {
        arenaLogin()
        break
      }
    }
  }

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function sanitize(input) {
    var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
      replace(/<[\/\!]*?[^<>]*?>/gi, '').
      replace(/<style[^>]*?>.*?<\/style>/gi, '').
      replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
    return output;
  }

  function findItemById(items, id) {
    for (let i in items) {
      if (items[i]._id === id) {
        return items[i]
      }
    }

    return null
  }

  function findFirstAccountOrganizationSite(accounts) {
    for (let i in accounts) {
      var account = accounts[i]
      if (!(account &&
        account.organizations &&
        Array.isArray(account.organizations) &&
        account.organizations.length > 0)
      ) {
        continue
      }

      var organizationSite = findFirstOrganizationSite(account.organizations)
      if (!organizationSite) {
        continue
      }

      return {
        account: account,
        organization: organizationSite.organization,
        site: organizationSite.site
      }
    }

    return null
  }

  function findFirstOrganizationSite(organizations) {
    for (var i in organizations) {
      var organization = organizations[i]
      if (!(organization &&
        organization.sites &&
        Array.isArray(organization.sites) &&
        organization.sites.length > 0)
      ) {
        continue
      }

      var site = findFirstSite(organization.sites, i === (organizations.length - 1))
      if (!site) {
        continue
      }

      return {
        organization,
        site
      }
    }

    return null
  }

  function findFirstSite(sites) {
    for (var i in sites) {
      if (sites[i]) {
        return sites[i]
      }
    }

    return null
  }

  function setSitesByAccount(account) {
    if (!account) return

    var siteId = albfre_settings_object.albfre_user_siteId

    var select = document.querySelector('.albfre-settings--body--accounts--form--select--sites')
    select.innerHTML = ''

    var sites = []
    var option
    for (var i = 0; i < account.organizations.length; i++) {
      var organization = account.organizations[i]
      for (var j = 0; j < organization.sites.length; j++) {
        var site = organization.sites[j]
        option = document.createElement('option')
        option.innerText = organization.name + ' - ' + site.name
        option.value = site._id

        if (siteId === site._id) {
          option.selected = true
        }

        select.appendChild(option)
      }
    }
  }

  function setAccounts(accounts) {
    var select = document.querySelector('.albfre-settings--body--accounts--form--select--acounts')
    var accountId = albfre_settings_object.albfre_user_accountId
    var siteId = albfre_settings_object.albfre_user_siteId

    var selectedAccount = null
    for (var i = 0; i < accounts.length; i++) {
      var account = accounts[i]

      option = document.createElement('option')
      option.innerText = account.name
      option.value = account._id

      if (accountId === account._id) {
        option.selected = true
        selectedAccount = account
      }

      select.appendChild(option)
    }

    setSitesByAccount(selectedAccount)
  }


  function arenaSetAccount() {
    var accountId = document.querySelector('.albfre-settings--body--accounts--form--select--acounts').value

    var account = null
    for (var i = 0; i < userAccounts.length; i++) {
      if (userAccounts[i]._id === accountId) {
        account = userAccounts[i]
        break
      }
    }

    setSitesByAccount(account)
  }

  function arenaSaveAccountSite() {
    var accountId = document.querySelector('.albfre-settings--body--accounts--form--select--acounts').value
    var siteId = document.querySelector('.albfre-settings--body--accounts--form--select--sites').value

    var data = {
      'action': 'albfre_set_account_action',
      'albfre_account': {
        accountId: accountId,
        siteId: siteId
      }
    };

    jQuery.post(albfre_settings_object.ajax_url, data, function (response) {
      var confirmationEl = document.querySelector('.albfre-settings--body--accounts--form--success')
      confirmationEl.style.opacity = 1

      setTimeout(function () {
        confirmationEl.style.opacity = 0
      }, 3000)
    })
  }

  function fetchUserAccounts(token) {
    var apiMeURL = albfre_settings_object.albfre_api_me_url
    var token = albfre_settings_object.albfre_user_token

    if (!token) return

    var settings = {
      "async": true,
      "crossDomain": true,
      "url": apiMeURL,
      "method": "GET",
      "headers": {
        "authorization": "Bearer " + token,
        "content-type": "application/json"
      },
      "processData": false
    }

    jQuery.ajax(settings).done(function (me) {
      userAccounts = me.user.accounts

      setAccounts(userAccounts)
    });
  }


  window.albfreWPPluginPreferences = {
    arenaLogin: arenaLogin,
    arenaLogout: arenaLogout,
    arenaHandleKeydown: arenaHandleKeydown,
    arenaSetAccount: arenaSetAccount,
    fetchUserAccounts: fetchUserAccounts,
    arenaSaveAccountSite: arenaSaveAccountSite
  }
})(window)

