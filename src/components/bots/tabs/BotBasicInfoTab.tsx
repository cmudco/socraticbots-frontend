import React, { forwardRef } from 'react';

import { Field, Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';

import { useDareLLMModels } from '@/hooks/queries/useDareLLMModels';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormValues {
  title: string;
  subject: string;
  topic: string;
  chatModelDareId: number | null;
  trackingModelDareId: number | null;
}

interface BotBasicInfoTabProps {
  viewOnly?: boolean;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  subject: Yup.string().required('Subject is required'),
  topic: Yup.string().required('Topic is required'),
  chatModelDareId: Yup.number().nullable().required('Chat model is required'),
  trackingModelDareId: Yup.number().nullable().required('Tracking model is required'),
});

const BotBasicInfoTab = forwardRef<FormikProps<FormValues>, BotBasicInfoTabProps>(
  ({ viewOnly = false }, ref) => {
    const {
      title,
      subject,
      topic,
      chatModelDareId,
      trackingModelDareId,
      updateField,
      updateModelField,
    } = useBotFormStore();

    const {
      data: dareLLMModels,
      isLoading: modelsLoading,
      error: modelsError,
    } = useDareLLMModels();

    const initialValues: FormValues = {
      title,
      subject,
      topic,
      chatModelDareId,
      trackingModelDareId,
    };

    return (
      <div className="space-y-6">
        <Formik
          innerRef={ref}
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={() => {}} // Handled by parent
        >
          {({ errors, touched, values, handleChange }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="title" className="text-foreground mb-1 block text-sm font-medium">
                  Bot Title *
                </label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  disabled={viewOnly}
                  value={values.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    updateField('title', e.target.value);
                  }}
                  className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
                  placeholder="Enter bot title"
                />
                {errors.title && touched.title && (
                  <p className="text-destructive mt-1 text-sm">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="text-foreground mb-1 block text-sm font-medium">
                  Subject *
                </label>
                <Field
                  id="subject"
                  name="subject"
                  type="text"
                  disabled={viewOnly}
                  value={values.subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    updateField('subject', e.target.value);
                  }}
                  className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
                  placeholder="e.g., Mathematics, Science, History"
                />
                {errors.subject && touched.subject && (
                  <p className="text-destructive mt-1 text-sm">{errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="topic" className="text-foreground mb-1 block text-sm font-medium">
                  Topic *
                </label>
                <Field
                  id="topic"
                  name="topic"
                  type="text"
                  disabled={viewOnly}
                  value={values.topic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    updateField('topic', e.target.value);
                  }}
                  className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
                  placeholder="e.g., Algebra, Chemistry, World War II"
                />
                {errors.topic && touched.topic && (
                  <p className="text-destructive mt-1 text-sm">{errors.topic}</p>
                )}
              </div>

              {/* Chat Model Selection */}
              <div>
                <label
                  htmlFor="chatModelDareId"
                  className="text-foreground mb-1 block text-sm font-medium"
                >
                  Chat Model *
                </label>
                {modelsError ? (
                  <div className="text-destructive text-sm">
                    Failed to load models. Please try again later.
                  </div>
                ) : (
                  <Select
                    disabled={viewOnly || modelsLoading}
                    value={values.chatModelDareId?.toString() || ''}
                    onValueChange={value => {
                      const modelId = value ? parseInt(value, 10) : null;
                      updateModelField('chatModelDareId', modelId);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={modelsLoading ? 'Loading models...' : 'Select a chat model'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {dareLLMModels?.map(model => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            {/* <span className="text-xs text-gray-500 capitalize">{model.provider}</span> */}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.chatModelDareId && touched.chatModelDareId && (
                  <p className="text-destructive mt-1 text-sm">{errors.chatModelDareId}</p>
                )}
              </div>

              {/* Tracking Model Selection */}
              <div>
                <label
                  htmlFor="trackingModelDareId"
                  className="text-foreground mb-1 block text-sm font-medium"
                >
                  Tracking Model *
                </label>
                {modelsError ? (
                  <div className="text-destructive text-sm">
                    Failed to load models. Please try again later.
                  </div>
                ) : (
                  <Select
                    disabled={viewOnly || modelsLoading}
                    value={values.trackingModelDareId?.toString() || ''}
                    onValueChange={value => {
                      const modelId = value ? parseInt(value, 10) : null;
                      updateModelField('trackingModelDareId', modelId);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          modelsLoading ? 'Loading models...' : 'Select a tracking model'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {dareLLMModels?.map(model => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            {/* <span className="text-xs text-gray-500 capitalize">{model.provider}</span> */}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.trackingModelDareId && touched.trackingModelDareId && (
                  <p className="text-destructive mt-1 text-sm">{errors.trackingModelDareId}</p>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
);

BotBasicInfoTab.displayName = 'BotBasicInfoTab';

export default BotBasicInfoTab;
