//API 網址與路徑
const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'mylmii';

//veeValidate
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max, integer } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

//定義驗證規則
defineRule('required',required);
defineRule('email',email);
defineRule('min',min);
defineRule('max',max);
defineRule('integer',integer);

//載入正體中文提示訊息
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
    generateMessage:localize('zh_TW'),
});

const app = Vue.createApp({
    // VeeValidate
    components:{
        VForm:Form,
        VField:Field,
        ErrorMessage:ErrorMessage,
    },
    data(){
        return{
            //購物車列表
            cartData:{
                carts:[],
            },
            //產品列表
            products:[],
            productId:'',
            isLoadingItem:'',
            //訂單資料
            form:{
                user:{
                    name:'',
                    email:'',
                    tel:'',
                    address:'',
                },
                message:'',
            },
            isPageLoading: false,
        };
    },
    methods:{
        //取得產品列表
        getProducts(){
            this.addLoading();
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then(res=>{
                    this.products = res.data.products;
                })
                .catch(err=>{
                    alert(err.data.message);
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
                    this.cartData = res.data.data;
                })
                .catch(err=>{
                    alert(err.data.message);
                });
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
                alert(res.data.message);
                this.getCart();
                this.$refs.productModal.closeModal();
                this.isLoadingItem = '';
            })
            .catch(err=>{
                alert(err.data.message);
            });
        },
        //刪除購物車特定品項
        removeCartItem(id){
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
            .then(res=>{
                alert(res.data.message);
                this.getCart();
                this.isLoadingItem = '';
            })
            .catch(err=>{
                alert(err.data.message);
            });
        },
        //刪除購物車全部品項
        removeAllCart(){
            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
            .then(res=>{
                alert(res.data.message);
                this.getCart();
            })
            .catch(err=>{
                alert(err.data.message);
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
                alert(res.data.message);
                this.getCart();
                this.isLoadingItem = '';
            })
            .catch(err=>{
                alert(err.data.message);
                this.isLoadingItem = '';
            });
        },
        createOrder(){
            const order = this.form;
            axios.post(`${apiUrl}/api/${apiPath}/order`,{data:order})
            .then(res=>{
                alert(res.data.message);
                this.$refs.form.resetForm();
                this.getCart();
            })
            .catch(err=>{
                alert(err.data.message);
            });
        },
        addLoading() {
            this.isPageLoading = true;
            setTimeout(()=>{
                this.isPageLoading = false;
          },700)
        }
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

app.component('page-loading',VueLoading.Component)

app.mount('#app');
