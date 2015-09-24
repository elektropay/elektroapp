

    //--------------------------------------------------------------------------
    //  Defines
    //--------------------------------------------------------------------------

    var instanceHost    = 'YOUR_DSP_HOST';
    var apiKey          = 'YOUR_APP_API_KEY';


    //--------------------------------------------------------------------------
    //  App init
    //--------------------------------------------------------------------------

    $('div[id^="template_"]').hide();
    $('#template_index').show();

    $('button[id^="menu_"]').hide();

    $.redirect('index');


    //--------------------------------------------------------------------------
    //  Login/Register
    //--------------------------------------------------------------------------

    $('#signin').on('click', function () {
        var email = $('#email').val();
        var password = $('#password').val();

        $.api.login(email, password);
    });


    //--------------------------------------------------------------------------
    //  Groups          groups
    //--------------------------------------------------------------------------

    var table = $('#table_groups').DataTable({
        "paging":   false,
        "ordering": false,
        "info":     false,
        "columnDefs": [
            { "visible": false, "targets": 0 }
        ]
    } );

    // Detect click on table row
    $('#table_groups tbody').on( 'click', 'tr', function () {
        var groupId = $('#table_groups').DataTable().row(this).data();
        $.redirect('group/' + groupId[0]);
    } );

    // Callback function, populate groups table
    var populateGroupsTable = function(data) {
        var _groups = data;
        var groups = [];

        $.each(_groups, function(id, group){
            groups.push([
                group.id,
                group.name
            ])
        })

        $('#table_groups').dataTable().fnClearTable();
        $('#table_groups').dataTable().fnAddData(groups);
    };


    //--------------------------------------------------------------------------
    //  Group Create    group/create
    //--------------------------------------------------------------------------

    var tableGroupCreate = $('#table_group_create').DataTable({
        "paging":   false,
        "ordering": false,
        "info":     false,
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 2 }
        ],
        "drawCallback": function ( settings ) {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;

            api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group info"><td colspan="3">'+group+'</td></tr>'
                    );

                    last = group;
                }
            } );

            $("#table_group_create thead").remove();
            $("#table_group_create tfoot").remove();
        }
    } );

    var populateGroupCreateTable = function(data) {
        var contacts = [];

        $.each(data, function(id, contact){
            contacts.push([
                contact.id,
                contact.first_name + ' ' + contact.last_name,
                contact.last_name.charAt(0).toUpperCase(),
                "<button type='button' class='btn btn-default btn-xs pull-right' data-toggle='button' aria-pressed='false' autocomplete='off' id='contact_" + contact.id + "'>Select</button>"
            ])
        });

        $('#table_group_create').dataTable().fnClearTable();
        $('#table_group_create').dataTable().fnAddData(contacts);
    };

    $('#group_save').on('click', function() {
        var save = {};
        save['name'] = $('#groupName').val();

        var params = JSON.stringify(save);

        $.api.setRecord('contact_group', params, apiKey, getToken('token'), function (data) {
            var groupId  = data[0].id;
            createGroupRelationships(groupId);
        });

        clearForm();
        $.redirect('groups');
    });

    function createGroupRelationships(groupId) {
        $('#table_group_create tr').each(function() {
            var columns = $(this).find('td');

            columns.each(function() {
                var box = $(this).find('button');

                if(box.length){
                    var id = box[0].id;

                    if ($('#' + id).hasClass('active')) {
                        var save = {};

                        save['contact_group_id'] = groupId;
                        save['contact_id'] = id.replace('contact_', '');

                        var params = JSON.stringify(save);

                        $.api.setRecord('contact_group_relationship', params, apiKey, getToken('token'), function (data){});
                    }
                }
            });
        });
    }


    //--------------------------------------------------------------------------
    //  Group Show      group/{id}
    //--------------------------------------------------------------------------

    var tableGroup = $('#table_group').DataTable({
        "paging":   false,
        "ordering": false,
        "info":     false,
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 2 }
        ],

        "drawCallback": function () {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;

            api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group info"><td colspan="3">'+group+'</td></tr>'
                    );

                    last = group;
                }
            } );

            $("#table_group thead").remove();
            $("#table_group tfoot").remove();
        }
    });

    var populateGroupTable = function(data) {
        var contacts = [];

        $.each(data, function(id, contact){
            contacts.push([
                contact.id,
                contact.first_name + ' ' + contact.last_name,
                contact.last_name.charAt(0).toUpperCase()
            ])
        });

        $('#table_group').dataTable().fnClearTable();
        $('#table_group').dataTable().fnAddData(contacts);
    };

    $('#table_group_search').keyup(function(){
        $('#table_group').DataTable().search($(this).val(), false, true).draw() ;
    });

    $('#table_group tbody').on( 'click', 'tr', function () {
        var contactId = $('#table_group').DataTable().row(this).data();

        if (contactId !== undefined)
            $.redirect('contact/' + contactId[0]);
    });




    //--------------------------------------------------------------------------
    //  Group Edit      group/{id}/edit
    //--------------------------------------------------------------------------

    var tableGroupEdit = $('#table_group_edit').DataTable({
        "paging":   false,
        "ordering": false,
        "info":     false,
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 2 }
        ],

        "drawCallback": function () {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;

            api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group info"><td colspan="3">'+group+'</td></tr>'
                    );

                    last = group;
                }
            } );

            $("#table_group_edit thead").remove();
            $("#table_group_edit tfoot").remove();
        }
    });

    var populateGroupName = function(data) {
        $('#group_edit_name').val(data.name);
    }

    var populateGroupEditTable = function(data, ids) {
        var contacts = [];

        $.each(data, function(id, contact){
            var selectButton = "<button type='button' class='btn btn-default btn-xs pull-right' data-toggle='button' aria-pressed='false' autocomplete='off' id='contact_" + contact.id + "'>Select</button>";

            if(ids.indexOf(parseInt(contact.id)) > -1) {
                selectButton = "<button type='button' class='btn btn-default btn-xs pull-right active' data-toggle='button' aria-pressed='false' autocomplete='off' id='contact_" + contact.id + "'>Select</button>";
            }

            contacts.push([
                contact.id,
                contact.first_name + ' ' + contact.last_name,
                contact.last_name.charAt(0).toUpperCase(),
                selectButton
            ])
        });

        $('#table_group_edit').dataTable().fnClearTable();
        $('#table_group_edit').dataTable().fnAddData(contacts);
    }

    $('#group_update').on('click', function() {
        var groupId = $('#group_edit_group').val();
        var params = 'filter=contact_group_id%3D' + groupId;

        $.api.deleteRecord('contact_group_relationship', params, apiKey, getToken('token'), function (data){
            updateGroupRelationships(groupId);
        });

        clearForm();
        $.redirect('groups/' + groupId);
    });


    function updateGroupRelationships(groupId) {
        $('#table_group_edit tr').each(function() {
            var columns = $(this).find('td');

            columns.each(function() {
                var box = $(this).find('button');

                if(box.length){
                    var id = box[0].id;
                    var idVal = id.replace('contact_', '');

                    if ($('#' + id).hasClass('active')) {
                        var save = {};

                        save['contact_group_id'] = groupId;
                        save['contact_id'] = idVal;

                        var params = JSON.stringify(save);

                        $.api.setRecord('contact_group_relationship', params, apiKey, getToken('token'), function (data){});
                    }
                }
            });
        });
    }

    $('#table_group_edit_search').keyup(function(){
        $('#table_group_edit').DataTable().search($(this).val(), false, true).draw() ;
    });


    //--------------------------------------------------------------------------
    //  Contact Show      contact/{id}
    //--------------------------------------------------------------------------

    var populateContact = function(data) {
        $('#contact_firstName').text(data.first_name);
        $('#contact_lastName').text(data.last_name);
        $('#contact_notes').text(data.notes);
        $('#contact_social').empty();

        if (data.twitter) {
            $('#contact_social').append('<img src="img/twitter2.png" height="25">&nbsp;&nbsp;' +
            data.twitter + '<br><br>');
        }

        if (data.skype) {
            $('#contact_social').append('<img src="img/skype.png" height="25">&nbsp;&nbsp;' +
            data.skype + '<br><br>');
        }
    };

    var populateContactInfo = function(data) {
        var types = '';

        $.each(data, function(index, value) {
            types += '<br><div class="infobox">';
            types += '<h4>' + value.info_type.charAt(0).toUpperCase() + value.info_type.slice(1) + '</h4>';
            types += '<div class="col-md-12">';
            types += '<div class="col-md-1">&nbsp;</div>';
            types += '<div class="col-md-1"><div style="height: 25px"><img src="img/phone.png" height="25"></div><br><img src="img/mail.png" height="25"></div>';
            types += '<div class="col-md-4"><div style="height: 25px">' + value.phone + '</div><br>' + value.email + '</div>';
            types += '<div class="col-md-1"><img src="img/home.png" height="25"></div>';
            types += '<div class="col-md-4">' + value.address + '<br>' + value.city + ', ' + value.state + ' ' + value.zip + '<br>' + value.country + '</div>';
            types += '<div class="col-md-1">&nbsp;</div>';
            types += '</div>';
            types += '</div>';
        });

        $('#contact_info_types').append(types);
    };

    //--------------------------------------------------------------------------
    //  Contact Create       contact/{:group_id}/create
    //--------------------------------------------------------------------------

    var contactGroupId = 0;

    $('#btn_contact_save').on('click', function() {
        var infos = getContactInfos();
        var save = {};

        $('#contact_create').find('input').each(function () {
            save[this.id] = this.value;
        });

        contactGroupId = $('#contact_create_group').val();

        var params = JSON.stringify(save);
        var contactId = 0;

        $.api.setRecord('contact', params, apiKey, getToken('token'), function(data) {
            contactId = data[0].id;
            $('#contact_create_contact').val(contactId);
            createContactRelationships(contactGroupId, contactId);

            $.each(infos, function(id, info) {
                info['contact_id'] = parseInt(contactId);
                var params = JSON.stringify(info);
                $.api.setRecord('contact_info', params, apiKey, getToken('token'), function (){});
            });
        });


        clearForm();

        $.redirect('group/' + contactGroupId);
    });


    function createContactRelationships(groupId, contactId) {
        var save = {};

        save['contact_group_id'] = parseInt(groupId);
        save['contact_id'] = parseInt(contactId);

        var params = JSON.stringify(save);

        $.api.setRecord('contact_group_relationship', params, apiKey, getToken('token'), function (){});
    }

    $('#contact_create_add_address').on('click', function() {
        var form = '<div class="form-group vert-offset-top-30"></div>';

        form += '<div class="form-group"><select name=type[] class="form-control type"><option value="work">Work</option><option value="home">Home</option><option value="mobile">Mobile</option><option value="other">Other</option></select></div>';
        form += '<div class="form-group"><input type="text" class="form-control phone" name="phone[]" placeholder="Phone"></div>';
        form += '<div class="form-group"><input type="text" class="form-control email" name="email[]" placeholder="Email"></div>';
        form += '<div class="form-group"><input type="text" class="form-control address" name="address[]" placeholder="Address"></div>';
        form += '<div class="form-group"><input type="text" class="form-control city" name="city[]" placeholder="City"></div>';
        form += '<div class="form-group"><input type="text" class="form-control state" name="state[]" placeholder="State"></div>';
        form += '<div class="form-group"><input type="text" class="form-control zip" name="zip[]" placeholder="Zip"></div>';
        form += '<div class="form-group"><input type="text" class="form-control country" name="country[]" placeholder="Country"></div>';

        $('#contact_infos').append(form);
    });

    function getContactInfos() {

        var type = [], phone = [], email = [], address = [],
            city = [], state = [], zip = [], country = [];

        $('.type').each(function(index, value){
            type[index] = $(value).val();
        });

        $('.phone').each(function(index, value){
            phone[index] = parseInt($(value).val());
        });

        $('.email').each(function(index, value){
            email[index] = $(value).val();
        });

        $('.address').each(function(index, value){
            address[index] = $(value).val();
        });

        $('.city').each(function(index, value){
            city[index] = $(value).val();
        });

        $('.state').each(function(index, value){
            state[index] = $(value).val();
        });

        $('.zip').each(function(index, value){
            zip[index] = parseInt($(value).val());
        });

        $('.country').each(function(index, value){
            country[index] = $(value).val();
        });

        var collection = [];

        for (var i = 0; i < type.length; i++) {
            var save = {};

            save['info_type'] = type[i];
            save['phone'] = parseInt(phone[i]);
            save['email'] = email[i];
            save['address'] = address[i];
            save['city'] = city[i];
            save['state'] = state[i];
            save['zip'] = parseInt(zip[i]);
            save['country'] = country[i];
            save['ordinal'] = 0;

            collection.push(save);
        }

        return collection;
    }


    //--------------------------------------------------------------------------
    //  Contact Edit       contact/{:contact_id}/edit
    //--------------------------------------------------------------------------

    var populateEditContact = function(data) {

        $.each(data, function(id, contact) {
            if(id === 'id') {
                $('#contact_edit_contact').val(contact);
            }
            else {
                $('#' + id + '_edit').val(contact);
            }
        });
    };

    var populateEditContactInfo = function(data) {
        $('#contact_infos_edit').empty();

        $.each(data, function(id, info) {
            var options = '';
            var form = '<div class="form-group vert-offset-top-30"></div>';

            switch (info.info_type) {
                case 'work':
                    options = '<option value="work" selected>Work</option><option value="home">Home</option><option value="mobile">Mobile</option><option value="other">Other</option>';
                    break;
                case 'home':
                    options = '<option value="work">Work</option><option value="home" selected>Home</option><option value="mobile">Mobile</option><option value="other">Other</option>';
                    break;
                case 'mobile':
                    options = '<option value="work">Work</option><option value="home">Home</option><option value="mobile" selected>Mobile</option><option value="other">Other</option>';
                    break;
                case 'other':
                    options = '<option value="work">Work</option><option value="home">Home</option><option value="mobile">Mobile</option><option value="other" selected>Other</option>';
                    break;
            }

            form += '<div class="form-group"><select name=type_edit[] class="form-control type_edit">' + options + '</select></div>';
            form += '<div class="form-group" ><input type="text" class="form-control phone_edit" name="phone_edit[]" placeholder="Phone" value="' + info.phone + '"></div>';
            form += '<div class="form-group" ><input type="text" class="form-control email_edit" name="email_edit[]" placeholder="Email" value="' + info.email + '"></div>';
            form += '<div class="form-group" ><input type="text" class="form-control address_edit" name="address_edit[]" placeholder="Address" value="' + info.address + '"></div>';
            form += '<div class="form-group" ><input type="text" class="form-control city_edit" name="city_edit[]" placeholder="City" value="' + info.city + '"></div>';
            form += '<div class="form-group" ><input type="text" class="form-control state_edit" name="state_edit[]" placeholder="State" value="' + info.state + '"></div>';
            form += '<div class="form-group" ><input type="text" class="form-control zip_edit" name="zip_edit[]" placeholder="Zip" value="' + info.zip + '"></div>';
            form += '<div class="form-group" ><input type="text" class="form-control country_edit" name="country_edit[]" placeholder="Country" value="' + info.country + '"></div>';

            $('#contact_infos_edit').append(form);
        });
    };


    $('#contact_edit_add_address').on('click', function() {
        var form = '<div class="form-group vert-offset-top-30"></div>';

        form += '<div class="form-group"><select name=type_edit[] class="form-control type_edit"><option value="work">Work</option><option value="home">Home</option><option value="mobile">Mobile</option><option value="other">Other</option></select></div>';
        form += '<div class="form-group" ><input type="text" class="form-control phone_edit" name="phone[]" placeholder="Phone"></div>';
        form += '<div class="form-group" ><input type="text" class="form-control email_edit" name="email[]" placeholder="Email"></div>';
        form += '<div class="form-group" ><input type="text" class="form-control address_edit" name="address[]" placeholder="Address"></div>';
        form += '<div class="form-group" ><input type="text" class="form-control city_edit" name="city[]" placeholder="City"></div>';
        form += '<div class="form-group" ><input type="text" class="form-control state_edit" name="state[]" placeholder="State"></div>';
        form += '<div class="form-group" ><input type="text" class="form-control zip_edit" name="zip[]" placeholder="Zip"></div>';
        form += '<div class="form-group" ><input type="text" class="form-control country_edit" name="country[]" placeholder="Country"></div>';

        $('#contact_infos_edit').append(form);
    });


    $('#btn_contact_update').on('click', function() {
        var infos = getContactEditInfos();
        var save = {};

        $('#contact_edit').find('input').each(function () {
            var indexMod = this.id.replace('_edit', '');

            if(indexMod.indexOf('contact_') < 0) {
                save[indexMod] = this.value;
            }
        });

        var contactId = $('#contact_edit_contact').val();
        var params = JSON.stringify(save);

        $.api.updateRecord('contact/' + contactId, params, apiKey, getToken('token'), function (data) {});

        var params = 'filter=contact_id%3D' + contactId;
        $.api.deleteRecord('contact_info', params, apiKey, getToken('token'), function (data){
            $.each(infos, function(id, info) {
                info['contact_id'] = parseInt(contactId);
                var params = JSON.stringify(info);
                $.api.setRecord('contact_info', params, apiKey, getToken('token'), function (){});
            });
        });

        clearForm();

        var previousUrl = window.location.hash.slice(1);
        $.redirect(previousUrl);
    });

    function getContactEditInfos() {

        var type = [], phone = [], email = [], address = [],
            city = [], state = [], zip = [], country = [];

        $('.type_edit').each(function(index, value){
            type[index] = $(value).val();
        });

        $('.phone_edit').each(function(index, value){
            phone[index] = $(value).val();
        });

        $('.email_edit').each(function(index, value){
            email[index] = $(value).val();
        });

        $('.address_edit').each(function(index, value){
            address[index] = $(value).val();
        });

        $('.city_edit').each(function(index, value){
            city[index] = $(value).val();
        });

        $('.state_edit').each(function(index, value){
            state[index] = $(value).val();
        });

        $('.zip_edit').each(function(index, value){
            zip[index] = $(value).val();
        });

        $('.country_edit').each(function(index, value){
            country[index] = $(value).val();
        });

        var collection = [];

        for (var i = 0; i < type.length; i++) {
            var save = {};

            save['info_type'] = type[i];
            save['phone'] = parseInt(phone[i]);
            save['email'] = email[i];
            save['address'] = address[i];
            save['city'] = city[i];
            save['state'] = state[i];
            save['zip'] = parseInt(zip[i]);
            save['country'] = country[i];
            save['ordinal'] = 0;

            collection.push(save);
        }

        return collection;
    }


    //--------------------------------------------------------------------------
    //  Misc functions
    //--------------------------------------------------------------------------

    function setToken(key, value) {
        sessionStorage.setItem(key, value);
    }

    function getToken(key) {
        return sessionStorage.getItem(key);
    }

    function clearForm() {
        $('input').each(function(){
            $(this).val('');
        });
    }













