import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { expand, visibility, flyInOut } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block'
  },
  animations: [
    expand(),
    flyInOut(),
    visibility()
  ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMsg: string;

  commentForm: FormGroup;
  comment: Comment;

  dishCopy: Dish;
  visibility = 'shown';

  @ViewChild('cform') commentFormDirective;

  constructor(private dishService: DishService,
    @Inject('BaseURL') private BaseURL,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location) {
      this.createForm();
    }

  ngOnInit(): void {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(params['id']); }))
.subscribe(dish => { this.dish = dish; this.dishCopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },

      errMsg => this.errMsg = <any>errMsg);
  }

  formErrors = {
    'author': '',
    'rating': '',
    'comment': '',
  };

  validationMessages = {
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long.',
      'maxlength': 'Name cannot contain more than 50 characters.',
    },
    'comment': {
      'required': 'Comment is required'
    }
  };

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      rating: 5,
      comment: ['', [Validators.required]]
    });
    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = (new Date()).toISOString();
    this.dishCopy.comments.push(this.comment);
    this.dishService.putDish(this.dishCopy)
      .subscribe(dish => {this.dish = dish; this.dishCopy = dish;},
                 errMsg => {this.dish = null; this.dishCopy = null; this.errMsg = <any>errMsg});
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: '',
    });
    this.commentFormDirective.resetForm({rating: 5});
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
