/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commomStyles from '../../styles/commom.module.scss';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) return <h1>Carregando...</h1>;

  const postData = post.data.content.map(data => ({
    heading: data.heading,
    content: RichText.asHtml(data.body),
  }));

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <section>
        <Header />

        <img
          src={post.data.banner.url}
          alt={post.data.banner.alt}
          className={styles.banner}
        />

        <main className={commomStyles.container}>
          <h1 className={styles.title}>{post.data.title}</h1>

          <div className={commomStyles.info}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>

            <span>
              <FiUser />
              {post.data.author}
            </span>

            <span>
              <FiClock /> 4 min
            </span>
          </div>

          <article className={styles.article}>
            {postData.map(data => (
              <div key={data.heading}>
                <h2>{data.heading}</h2>

                <div dangerouslySetInnerHTML={{ __html: data.content }} />
              </div>
            ))}
          </article>
        </main>
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'pos')
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('pos', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
