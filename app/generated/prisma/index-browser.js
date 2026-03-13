
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.SchoolScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  summary: 'summary',
  grade: 'grade',
  subject: 'subject',
  chapter: 'chapter',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PageScalarFieldEnum = {
  id: 'id',
  chapterId: 'chapterId',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BoardScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.EduSchoolScalarFieldEnum = {
  id: 'id',
  keyword: 'keyword',
  name: 'name',
  logo_data_url: 'logo_data_url',
  is_active: 'is_active',
  created_at: 'created_at',
  user_counter: 'user_counter'
};

exports.Prisma.ClassScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.SubjectScalarFieldEnum = {
  id: 'id',
  board_id: 'board_id',
  name: 'name',
  is_active: 'is_active'
};

exports.Prisma.ClassSubjectScalarFieldEnum = {
  id: 'id',
  class_id: 'class_id',
  subject_id: 'subject_id'
};

exports.Prisma.SchoolClassSubjectScalarFieldEnum = {
  school_id: 'school_id',
  class_subject_id: 'class_subject_id'
};

exports.Prisma.UserClassSubjectScalarFieldEnum = {
  user_id: 'user_id',
  class_subject_id: 'class_subject_id'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  school_id: 'school_id',
  name: 'name',
  login_id: 'login_id',
  email: 'email',
  mobile: 'mobile',
  role: 'role',
  password_hash: 'password_hash',
  must_change_password: 'must_change_password',
  is_active: 'is_active',
  created_at: 'created_at'
};

exports.Prisma.BookScalarFieldEnum = {
  id: 'id',
  class_subject_id: 'class_subject_id',
  title: 'title',
  order_no: 'order_no',
  thumbnail_url: 'thumbnail_url'
};

exports.Prisma.ChapterScalarFieldEnum = {
  id: 'id',
  book_id: 'book_id',
  title: 'title',
  order_no: 'order_no'
};

exports.Prisma.TopicScalarFieldEnum = {
  id: 'id',
  chapter_id: 'chapter_id',
  title: 'title',
  order_no: 'order_no'
};

exports.Prisma.StudentRevisionNoteScalarFieldEnum = {
  id: 'id',
  student_id: 'student_id',
  school_id: 'school_id',
  topic_id: 'topic_id',
  content_json: 'content_json',
  content_text: 'content_text'
};

exports.Prisma.EduPageScalarFieldEnum = {
  id: 'id',
  topic_id: 'topic_id',
  page_order: 'page_order',
  content_json: 'content_json',
  content_html: 'content_html',
  content_text: 'content_text',
  is_published: 'is_published',
  created_at: 'created_at',
  updated_at: 'updated_at',
  vector_file_id: 'vector_file_id'
};

exports.Prisma.PageHighlightScalarFieldEnum = {
  id: 'id',
  page_id: 'page_id',
  student_id: 'student_id',
  from_pos: 'from_pos',
  to_pos: 'to_pos',
  color: 'color',
  created_at: 'created_at'
};

exports.Prisma.XpRuleScalarFieldEnum = {
  activity_type: 'activity_type',
  activity_displayname: 'activity_displayname',
  xp_points: 'xp_points'
};

exports.Prisma.StudentGamificationStateScalarFieldEnum = {
  student_id: 'student_id',
  total_xp: 'total_xp',
  current_streak: 'current_streak',
  longest_streak: 'longest_streak',
  last_active_date: 'last_active_date'
};

exports.Prisma.StudentTopicProgressScalarFieldEnum = {
  student_id: 'student_id',
  topic_id: 'topic_id',
  class_subject_id: 'class_subject_id',
  accuracy: 'accuracy',
  last_activity_at: 'last_activity_at'
};

exports.Prisma.StudentPageProgressScalarFieldEnum = {
  student_id: 'student_id',
  page_id: 'page_id',
  class_subject_id: 'class_subject_id',
  is_completed: 'is_completed',
  completed_at: 'completed_at'
};

exports.Prisma.StudentTopicRevisionScalarFieldEnum = {
  id: 'id',
  student_id: 'student_id',
  topic_id: 'topic_id',
  current_interval_in_days: 'current_interval_in_days',
  last_interval_at: 'last_interval_at',
  next_revision_at: 'next_revision_at',
  revision_counter: 'revision_counter',
  is_pending: 'is_pending'
};

exports.Prisma.FlashcardScalarFieldEnum = {
  id: 'id',
  topic_id: 'topic_id',
  student_id: 'student_id',
  question: 'question',
  answer: 'answer',
  scope: 'scope',
  create_at: 'create_at',
  updated_at: 'updated_at'
};

exports.Prisma.StudentFlashcardStateScalarFieldEnum = {
  id: 'id',
  student_id: 'student_id',
  flashcard_id: 'flashcard_id',
  repetition: 'repetition',
  lapses: 'lapses',
  interval_factor: 'interval_factor',
  last_quality: 'last_quality',
  next_review_at: 'next_review_at',
  last_reviewed_at: 'last_reviewed_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  topic_id: 'topic_id',
  type: 'type',
  content: 'content',
  explanation: 'explanation',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OptionScalarFieldEnum = {
  id: 'id',
  question_id: 'question_id',
  content: 'content',
  isCorrect: 'isCorrect',
  display_order: 'display_order',
  created_at: 'created_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  student: 'student',
  teacher: 'teacher',
  principal: 'principal',
  admin: 'admin',
  superadmin: 'superadmin'
};

exports.FlashcardScope = exports.$Enums.FlashcardScope = {
  personal: 'personal',
  ai: 'ai',
  global: 'global'
};

exports.ReviewQuality = exports.$Enums.ReviewQuality = {
  again: 'again',
  hard: 'hard',
  good: 'good',
  easy: 'easy'
};

exports.QuestionType = exports.$Enums.QuestionType = {
  MCQ: 'MCQ',
  MSQ: 'MSQ',
  TRUE_FALSE: 'TRUE_FALSE'
};

exports.Prisma.ModelName = {
  School: 'School',
  Document: 'Document',
  Page: 'Page',
  Board: 'Board',
  EduSchool: 'EduSchool',
  Class: 'Class',
  Subject: 'Subject',
  ClassSubject: 'ClassSubject',
  SchoolClassSubject: 'SchoolClassSubject',
  UserClassSubject: 'UserClassSubject',
  User: 'User',
  Book: 'Book',
  Chapter: 'Chapter',
  Topic: 'Topic',
  StudentRevisionNote: 'StudentRevisionNote',
  EduPage: 'EduPage',
  PageHighlight: 'PageHighlight',
  XpRule: 'XpRule',
  StudentGamificationState: 'StudentGamificationState',
  StudentTopicProgress: 'StudentTopicProgress',
  StudentPageProgress: 'StudentPageProgress',
  StudentTopicRevision: 'StudentTopicRevision',
  Flashcard: 'Flashcard',
  StudentFlashcardState: 'StudentFlashcardState',
  Question: 'Question',
  Option: 'Option'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
