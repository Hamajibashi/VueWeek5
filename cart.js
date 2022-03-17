import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.prod.min.js';

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'mylmii';

const app = createApp({
    data(){
        return{
            //購物車列表
            cartData:{},
            //產品列表
            products:[],
            productId:'',
            isLoadingItem:'',
        };
    },
    methods:{
        //取得產品列表
        getProducts(){
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then(res=>{
                    this.products = res.data.products;
                });
        },
        //打開 productModal
        openProductModal(id){
            this.productId = id;
            this.$refs.productModal.openModal();
        },
        //取得購物車列表
        getCart(){
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then(res=>{
                    console.log(res);
                    this.cartData = res.data.data;
                })
        },
        //加入購物車
        addToCart(id, qty = 1){
            const data ={
                product_id:id,
                qty,
            };
            this.isLoadingItem = id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`,{data})
            .then(res=>{
                this.getCart();
                this.$refs.productModal.closeModal();
                this.isLoadingItem = '';
            });
        },
        //刪除特定品項
        removeCartItem(id){
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
            .then(res=>{
                this.getCart();
                this.isLoadingItem = '';
            });
        },
        //更新數量
        updateCartItem(item){
            const data ={
                product_id:item.id,
                qty:item.qty,
            };
            this.isLoadingItem = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`,{data})
            .then(res=>{
                this.getCart();
                this.isLoadingItem = '';
            });
        },
    },
    mounted(){
        this.getProducts();
        this.getCart();
    },
});

//註冊元件 productModal
app.component('product-modal',{
    props:['id'],
    template:'#userProductModal',
    data(){
        return{
            modal:{},
            product:{},
            qty:1,
        };
    },
    watch:{
        id(){
            this.getProduct();
        }
    },
    methods:{
        openModal(){
            this.modal.show();
        },
        closeModal(){
            this.modal.hide();
        },
        getProduct(){
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
                .then(res=>{
                    this.product = res.data.product;
                });
        },
        addToCart(){
            this.$emit('add-cart',this.product.id,this.qty);
        },
    },
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal,{ keyboard:false });
    },
});

app.mount('#app');
