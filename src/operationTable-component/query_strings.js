// Strings Used to Query API for types and operators
const QueryString =
  'query{__schema{types{kind name possibleTypes{name}inputFields{name type{name ofType{name}}}description enumValues{name}fields{name type{name ofType{name}}}} queryType{fields{name description type {name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}}}}';
const MutationString =
  'query{__schema{types{kind name possibleTypes{name}inputFields{name type{name ofType{name}}}description enumValues{name}fields{name type{name ofType{name}}}} mutationType{fields{name description type{name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}}}}';
const SubscriptionString =
  'query{__schema{types{kind name possibleTypes{name}inputFields{name type{name ofType{name}}}description enumValues{name}fields{name type{name ofType{name}}}} subscriptionType{fields{name description type{name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}}}}';
const OperationString =
  'query{__schema{types{kind name possibleTypes{name}inputFields{name type{name ofType{name}}}description enumValues{name}fields{name type{name ofType{name}}}} queryType{fields{name description type {name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}} subscriptionType{fields{name description type {name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}} mutationType{fields{name description type{name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}}}}';

export { QueryString, MutationString, SubscriptionString, OperationString };
