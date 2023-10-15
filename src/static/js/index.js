$(document).ready(function() {
    $('#reputationOption').on('change', function() {
        if($(this).val() == "new") {
            $('#dataOption').html(
                '<div class="mb-3">' +
                    '<label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>' +
                    '<input type="number" class="form-control" id="reputationToken"/>' +
                '</div>' +
                '<div class="mb-3">' +
                    '<label for="reputationRegister" class="form-label">Object to assign reputation</label>' +
                    '<input type="text" class="form-control" id="reputationRegister"/>' +
                '</div>'
            );
        } else if($(this).val() == "another") {
            $.ajax({
                url: "/get_unexpended_reputation_proofs/" + "9ejNy2qoifmzfCiDtEiyugthuXMriNNPhNKzzwjPtHnrK3esvbD",
                type: "get",
                success: function(values) {
                    let htmlData = '<div class="mb-3">' +
                        '<label for="reputationProof" class="form-label">Reputation proof</label>' +
                            '<select class="form-select" id="reputationProof">' +
                            '<option></option>';

                    values.forEach(function (value) {
                        htmlData += '<option value="' + value['box_id'] + '" data-amount-free="' +
                            value['free_amount'] + '" data-token-id="' + value['token_id'] + '">' + value['box_id'].substring(0, 12) +
                            ' (Free percentage: ' + value['free_percentage'] + ')</option>';
                    });

                    htmlData += '</select></div><div id="tokenRegister"></div>';

                    $('#dataOption').html(htmlData);

                    $('#reputationProof').on('change', function() {
                        $('#tokenRegister').html('<div class="mb-3">' +
                                '<label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>' +
                                '<input type="number" class="form-control" id="reputationToken" max="' + $(this).attr('data-amount-free') +
                                '"/>' +
                            '</div>' +
                            '<div class="mb-3">' +
                                '<label for="reputationRegister" class="form-label">Object to assign reputation</label>' +
                                '<input type="text" class="form-control" id="reputationRegister"/>' +
                            '</div>');
                    });
                }
            })
        }
    })

    $('#saveChanges').on('click', function() {
        /*
            When the "Save changes" button is clicked, the reputation proof information is sent to the wallet.
                let new_one = false;
                let token_id = null;
                let amount = $('#reputationToken').val();
                if($('#reputationOption').val()) {
                    new_one = true;
                } else {
                    token_id = $('#reputationProof :selected').attr('data-token-id');
                }
                generate_reputation_proof(new_one, token_id, amount);
        */
        Swal.fire({
            icon: 'success',
            title: 'Reputation proof has been successfully added!'
        }).then(() => {
             window.location = '/';
        });
    })
})