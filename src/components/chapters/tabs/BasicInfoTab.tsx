import { forwardRef } from 'react';

import { Field, Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';

import { type Model, useModels } from '@/hooks/queries/useModels';

import { useChapterFormStore } from '@/stores/forms/chapterFormStore';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BasicInfoSchema = Yup.object().shape({
  title: Yup.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .required('Title is required'),
  subject: Yup.string()
    .min(1, 'Subject is required')
    .max(255, 'Subject must be less than 255 characters')
    .required('Subject is required'),
  topic: Yup.string()
    .min(1, 'Topic is required')
    .max(255, 'Topic must be less than 255 characters')
    .required('Topic is required'),
  chat_model_id: Yup.string().optional(),
  tracking_model_id: Yup.string().optional(),
});

interface FormValues {
  title: string;
  subject: string;
  topic: string;
  chat_model_id: string;
  tracking_model_id: string;
}

interface BasicInfoTabProps {
  viewOnly?: boolean;
}

const BasicInfoTab = forwardRef<FormikProps<FormValues>, BasicInfoTabProps>(
  ({ viewOnly = false }, ref) => {
    const { title, subject, topic, chat_model_id, tracking_model_id, updateField } =
      useChapterFormStore();

    const { data: availableModels = [], isLoading: modelsLoading } = useModels();

    const initialValues: FormValues = {
      title: title || '',
      subject: subject || '',
      topic: topic || '',
      chat_model_id: chat_model_id || '',
      tracking_model_id: tracking_model_id || '',
    };

    const handleSubmit = (values: FormValues) => {
      Object.entries(values).forEach(([field, value]) => {
        updateField(field, value);
      });
    };

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={BasicInfoSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        innerRef={ref}
        validateOnMount={false}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
          const handleFieldChange =
            (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              handleChange(event);
              updateField(field, value);
            };

          const handleSelectChange = (field: string) => (value: string) => {
            setFieldValue(field, value);
            updateField(field, value);
          };

          return (
            <Form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Title {!viewOnly && '*'}
                </Label>
                <Field
                  as={Input}
                  id="title"
                  name="title"
                  type="text"
                  placeholder={viewOnly ? undefined : 'Enter bot title'}
                  disabled={viewOnly}
                  readOnly={viewOnly}
                  className={`border-slate-200 focus:border-violet-300 focus:ring-violet-200 ${
                    !viewOnly && errors.title && touched.title
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : ''
                  }`}
                  onChange={viewOnly ? undefined : handleFieldChange('title')}
                  onBlur={viewOnly ? undefined : handleBlur}
                />
                {!viewOnly && errors.title && touched.title && (
                  <div className="mt-1 text-sm text-red-600">{errors.title}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                  Subject {!viewOnly && '*'}
                </Label>
                <Field
                  as={Input}
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder={viewOnly ? undefined : 'Enter subject area'}
                  disabled={viewOnly}
                  readOnly={viewOnly}
                  className={`border-slate-200 focus:border-violet-300 focus:ring-violet-200 ${
                    !viewOnly && errors.subject && touched.subject
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : ''
                  }`}
                  onChange={viewOnly ? undefined : handleFieldChange('subject')}
                  onBlur={viewOnly ? undefined : handleBlur}
                />
                {!viewOnly && errors.subject && touched.subject && (
                  <div className="mt-1 text-sm text-red-600">{errors.subject}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium text-slate-700">
                  Topic {!viewOnly && '*'}
                </Label>
                <Field
                  as={Input}
                  id="topic"
                  name="topic"
                  type="text"
                  placeholder={viewOnly ? undefined : 'Enter specific topic'}
                  disabled={viewOnly}
                  readOnly={viewOnly}
                  className={`border-slate-200 focus:border-violet-300 focus:ring-violet-200 ${
                    !viewOnly && errors.topic && touched.topic
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : ''
                  }`}
                  onChange={viewOnly ? undefined : handleFieldChange('topic')}
                  onBlur={viewOnly ? undefined : handleBlur}
                />
                {!viewOnly && errors.topic && touched.topic && (
                  <div className="mt-1 text-sm text-red-600">{errors.topic}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat_model_id" className="text-sm font-medium text-slate-700">
                  Chat Model
                </Label>
                {modelsLoading ? (
                  <div className="text-sm text-slate-500">Loading models...</div>
                ) : (
                  <Select
                    value={values.chat_model_id}
                    onValueChange={viewOnly ? undefined : handleSelectChange('chat_model_id')}
                    disabled={viewOnly}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-violet-300 focus:ring-violet-200">
                      <SelectValue
                        placeholder={viewOnly ? 'No model selected' : 'Select Chat Model'}
                      />
                    </SelectTrigger>
                    {!viewOnly && (
                      <SelectContent>
                        {availableModels.map((model: Model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                )}
                {errors.chat_model_id && touched.chat_model_id && (
                  <div className="mt-1 text-sm text-red-600">{errors.chat_model_id}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking_model_id" className="text-sm font-medium text-slate-700">
                  Progress Tracking Model
                </Label>
                {modelsLoading ? (
                  <div className="text-sm text-slate-500">Loading models...</div>
                ) : (
                  <Select
                    value={values.tracking_model_id}
                    onValueChange={viewOnly ? undefined : handleSelectChange('tracking_model_id')}
                    disabled={viewOnly}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-violet-300 focus:ring-violet-200">
                      <SelectValue
                        placeholder={
                          viewOnly ? 'No model selected' : 'Select Progress Tracking Model'
                        }
                      />
                    </SelectTrigger>
                    {!viewOnly && (
                      <SelectContent>
                        {availableModels.map((model: Model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                )}
                {errors.tracking_model_id && touched.tracking_model_id && (
                  <div className="mt-1 text-sm text-red-600">{errors.tracking_model_id}</div>
                )}
              </div>

              <button type="submit" style={{ display: 'none' }} />
            </Form>
          );
        }}
      </Formik>
    );
  }
);

BasicInfoTab.displayName = 'BasicInfoTab';

export default BasicInfoTab;
