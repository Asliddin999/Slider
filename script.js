class Slider {
    constructor({ 
        slider = '.slider',
        sliderLines = '.slider__lines',
        sliderItem = '.slider__item',
        duration = 400,
        direction = 'x',
        active = 0,
        slidesToMove = 1,
        slidesToShow = 1,
        margin = 0,
        buttons = false,
        pagination = false,
        breakpoints
    }){
        this.slider = slider instanceof HTMLElement ? slider : document.querySelector(slider);
        this.sliderLines = sliderLines instanceof HTMLElement ? sliderLines : this.slider.querySelector(sliderLines);
        this.sliderItems = sliderItem instanceof HTMLElement ? sliderItem : this.slider.querySelectorAll(sliderItem);
        this.duration = duration >= 200 && duration <= 2000 ? duration : 400;
        this.direction = direction.toUpperCase();
        this.active = active < 0 || active > this.sliderItems.length - 1 ? 0 : active;
        this.slidesToMove = slidesToMove >= this.sliderItems.length || slidesToMove <= 0 ? 1 : slidesToMove;
        this.margin = margin > 100 || margin < 0 ? 0 : margin;
        this.slidesToShow = slidesToShow > 0 ? slidesToShow : 1;
        this.sliderTrueSize = this.slider.querySelector('.slider__true-size'); 
        this.posX1 = 0;
        this.posX2 = 0;
        this.posInit = 0;
        this.buttons = buttons;
        this.pagination = pagination;
        this.breakpoints = breakpoints; 
        if(this.buttons){
            this.prev = this.slider.querySelector('.slider__prev');
            this.next = this.slider.querySelector('.slider__next');
            this.disableButtons();
            this.prev.addEventListener('click', () => this.moveLeft());
            this.next.addEventListener('click', () => this.moveRight());
        }
        if(this.pagination) {
            this.navigation = this.slider.querySelector('.slider__pagination');
            this.navigation.innerHTML = '';
            for (let i = 0; i < this.sliderItems.length; i++) {
                let li = '<li></li>';
                this.navigation.innerHTML += li;
            }
            this.bullets = [...this.navigation.children];
            this.bullets.forEach(item => {
                item.addEventListener('click', (e) => this.bulletsClick(e));
            })
        }
        this.copySlider = {};
        for (const key in this) {
           this.copySlider[key] = this[key];
        }
        this.setClass();
        this.basicStyles();
        window.addEventListener('resize', () => this.basicStyles());
        this.slider.addEventListener('mousedown', this.touchStart);
        this.slider.addEventListener('touchstart', this.touchStart);
    } 
    basicStyles(){
        //clientWidth - без учетка ползунка прокрутки
        //offsetWidth - с учетом ползунка прокрутки
        //scrollWidth - полная ширина элемента со всем прокручиваемым контентом
        this.slider.style.overflow = 'hidden';
        this.sliderLines.style.overflow = 'hidden';
        this.sliderTrueSize.style.overflow = 'hidden';
        this.sliderLines.style.display = 'flex';
        if(this.breakpoints){
            let sorting = (a,b) => a - b;
            let keys = Object.keys(this.breakpoints).sort(sorting).reverse();
            keys.push(0);
            for (let i = 0; i < keys.length; i++) {
                if(window.innerWidth <= keys[i] && window.innerWidth > keys[i+1]){
                    for (const id in this.breakpoints[keys[i]]) {
                       this[id] = this.breakpoints[keys[i]][id]; 
                    }
                }
                else if(window.innerWidth > keys[0]) {
                    for (const id in this.breakpoints[keys[i]]) {
                        this[id] = this.copySlider[id]; 
                     }
                }
            }
        }
        this.sliderItems.forEach(item => {
            if(this.direction == 'Y') {
                item.style.paddingBottom = this.margin + 'px';
            }
            else {
                item.style.paddingRight = this.margin + 'px';
                item.style.width = this.sliderTrueSize.offsetWidth / this.slidesToShow + 'px';
            }
        });
        if(this.direction == 'Y') {
            this.sliderLines.style.flexDirection = 'column';
            this.sliderTrueSize.style.height = this.sliderItems[this.active].offsetHeight * this.slidesToShow + 'px';
            this.sliderLines.style.height = this.sliderLines.scrollHeight + 'px';
        }
        else {
            this.sliderLines.style.width = this.sliderLines.scrollWidth + 'px';
        }
        this.sliderLines.style.transform = `translate${this.direction}(${-this.slidesToMoving()}px)`;
        this.sliderLines.style.transition = '0ms';
    }
    moveLeft(){
        if(this.active - this.slidesToMove >= 0) this.active -= this.slidesToMove;
        else this.active--;
        if(this.active < 0) this.active = 0;
        this.setClass();
        if(this.buttons) this.disableButtons();
        this.sliderLines.style.transform = `translate${this.direction}(${-this.slidesToMoving()}px)`;
    }
    moveRight(){
        if(this.active + this.slidesToMove < this.sliderItems.length+1) this.active += this.slidesToMove;
        else this.active++;
        if(this.active > this.sliderItems.length - 1) this.active = this.sliderItems.length - 1;
        this.setClass();
        if(this.buttons) this.disableButtons();
        this.sliderLines.style.transform = `translate${this.direction}(${-this.slidesToMoving()}px)`;
    }
    touchStart = (e) => {
        if(e.type == 'touchstart') this.posX1 = this.direction == 'X' ? e.touches[0].clientX :  e.touches[0].clientY;
        else this.posX1 = this.direction == 'X' ? e.clientX : e.clientY;
        document.addEventListener('mousemove', this.touchMove);
        document.addEventListener('touchmove', this.touchMove);
        document.addEventListener('mouseup', this.touchEnd);
        document.addEventListener('touchend', this.touchEnd);
    }
    touchMove = (e) => {
        //changedTouches
        if(e.type == 'touchmove') this.posX2 = this.direction == 'X' ? e.changedTouches[0].clientX :  e.changedTouches[0].clientY;
        else this.posX2 = this.direction == 'X' ? e.clientX : e.clientY;
        this.posInit = this.posX2 - this.posX1;
        this.sliderLines.style.transition = '0ms';
        this.sliderLines.style.transform = `translate${this.direction}(${-this.slidesToMoving() + this.posInit}px)`;
    }
    touchEnd = () => {
        this.sliderLines.style.transition = `${this.duration}ms`;
        let end = this.direction == 'Y' ? this.slider.clientHeight/100*25 : this.slider.clientWidth/100*25;
        if(this.posInit > end) this.moveLeft();
        else if(this.posInit < -end) this.moveRight();
        else this.sliderLines.style.transform = `translate${this.direction}(${-this.slidesToMoving()}px)`;
        this.posX1 = 0;
        this.posX2 = 0;
        this.posInit = 0;
        document.removeEventListener('mousemove', this.touchMove);
        document.removeEventListener('touchmove', this.touchMove);
        document.removeEventListener('mouseup', this.touchEnd);
        document.removeEventListener('touchend', this.touchEnd);
    }
    bulletsClick(e){
        let idx = this.bullets.indexOf(e.target);
        this.active = idx;
        this.setClass();
        if(this.buttons) this.disableButtons();
        this.sliderLines.style.transform = `translate${this.direction}(${-this.slidesToMoving()}px)`;
    }
    slidesToMoving(){
        let limit = this.sliderItems[this.active].offsetWidth;
        let limit2 = this.sliderItems[this.active].offsetHeight;
        return this.direction == 'Y' ? limit2 * this.active : limit * this.active;
    } 
    disableButtons(){
        if(this.active <= 0) this.prev.disabled = true;
        else this.prev.disabled = false;
        if(this.active >= this.sliderItems.length - 1) this.next.disabled = true;
        else this.next.disabled = false;
    }
    setClass(){
        this.sliderItems.forEach((item, i) => {
            item.classList.remove('prev', 'next','active');
            if(this.pagination) this.bullets[i].classList.remove('active');
        });
        if(this.pagination) this.bullets[this.active].classList.add('active');
        this.sliderItems[this.active].classList.add('active');
        if(this.sliderItems[this.active].previousElementSibling){
            this.sliderItems[this.active].previousElementSibling.classList.add('prev'); 
        }
        if(this.sliderItems[this.active].nextElementSibling) {
            this.sliderItems[this.active].nextElementSibling.classList.add('next');
        }
    } 
}

const mySlider = new Slider({
    slider: '.slider',
    active: 1,
    direction: 'x',
    duration: 1000,
    slidesToMove: 1,
    slidesToShow: 3,
    margin: 30,
    buttons: true,
    pagination: true,
    breakpoints: {
        1200: {
            slidesToShow: 2,
            margin: 15
        },
        500: {
            slidesToShow: 1,
            margin: 0
        },
    }
});
const mySlider2 = new Slider({
    slider: '.slider2',
    active: 1,
    direction: 'y',
    duration:1500,
    slidesToMove: 1,
    slidesToShow: 1.3,
    // margin: 30,
    buttons: true,
    pagination: true,
});