const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    console.log(prodId, csrf, 'prodId csrf');

    const productElement = btn.closest('article');

    fetch(`/admin/product/${prodId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(result => {
            console.log('result', result);
            return result.json();
            // return location.reload();
        })
        .then(data => {
            console.log('data', data);
            productElement.remove();
        })
        .catch(err => console.log('Error while deleting a product: ', err))
};